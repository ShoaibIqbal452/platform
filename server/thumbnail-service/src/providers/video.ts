//
// Copyright © 2024 Hardcore Engineering Inc.
//
// Licensed under the Eclipse Public License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License. You may
// obtain a copy of the License at https://www.eclipse.org/legal/epl-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//
// See the License for the specific language governing permissions and
// limitations under the License.
//

import core, {
  generateId,
  type Blob,
  type MeasureContext,
  type Ref,
  type TxOperations,
  type WorkspaceId
} from '@hcengineering/core'
import { type StorageAdapter } from '@hcengineering/server-core'

import ffmpeg from 'fluent-ffmpeg'
import { mkdtemp, rm, writeFile } from 'fs/promises'
import { tmpdir } from 'os'
import { join } from 'path'
import { Writable } from 'stream'

import { type ObjectThumbnailFuncParams, type ObjectThumbnailProvider } from '../types'
import { withContext } from '../utils'

/** @public */
export const provider: ObjectThumbnailProvider<Blob> = {
  objectClass: core.class.Blob,
  provideIf,
  provide: withContext('video/*', provide)
}

async function generateThumbnail (filename: string, params: ObjectThumbnailFuncParams): Promise<Buffer> {
  return await new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    const output = new Writable({
      write (chunk, encoding, callback) {
        chunks.push(chunk)
        callback()
      }
    })

    ffmpeg(filename)
      .outputOptions('-ss 00:00:01')
      .outputOptions('-vframes 1')
      .outputOptions('-f image2pipe')
      .outputOptions(`-vcodec ${params.format}`)
      .on('end', () => {
        const result = Buffer.concat(chunks)
        resolve(result)
      })
      .on('error', (error: Error) => {
        reject(error)
      })
      .output(output)
      .run()
  })
}

async function provide (
  ctx: MeasureContext,
  client: TxOperations,
  storageAdapter: StorageAdapter,
  workspaceId: WorkspaceId,
  obj: Blob,
  params: ObjectThumbnailFuncParams
): Promise<Ref<Blob>> {
  const previewId = `preview-${generateId()}` as Ref<Blob>

  const readable = await ctx.with('read-blob', {}, async (ctx) => {
    return await storageAdapter.get(ctx, workspaceId, obj.storageId)
  })

  const tempdir = await mkdtemp(join(tmpdir(), 'thumbnail'))
  const filename = join(tempdir, 'video.mp4')

  try {
    // ffmpeg cannot generate thumnail for video streams
    // so we have to download video to the temporary file
    await ctx.with('save-temp-file', {}, async () => {
      await writeFile(filename, readable)
    })

    const buffer = await ctx.with('generate-thumbnail', {}, async () => {
      return await generateThumbnail(filename, params)
    })

    await ctx.with('save-blob', {}, async (ctx) => {
      await storageAdapter.put(
        ctx,
        workspaceId,
        previewId,
        buffer,
        `image/${params.format}`,
        buffer.length
      )
    })
  } finally {
    await ctx.with('remove-temp-file', {}, async () => {
      await rm(tempdir, { force: true, recursive: true })
    })
  }

  return previewId
}
