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

import { type ObjectThumbnailFuncParams, type ObjectThumbnailProvider } from '../types'
import { withContext } from '../utils'
import { gmPipeline, gmToBuffer } from './utils'

/** @public */
export const provider: ObjectThumbnailProvider<Blob> = {
  objectClass: core.class.Blob,
  provideIf,
  provide: withContext('image/gif', provide)
}

function provideIf (ctx: MeasureContext, obj: Blob): boolean | Promise<boolean> {
  return obj.contentType.includes('image/gif')
}

async function provide (
  ctx: MeasureContext,
  client: TxOperations,
  storageAdapter: StorageAdapter,
  workspaceId: WorkspaceId,
  obj: Blob,
  params: ObjectThumbnailFuncParams
): Promise<Ref<Blob>> {
  const readable = await ctx.with('read-blob', {}, async (ctx) => {
    return await storageAdapter.get(ctx, workspaceId, obj.storageId)
  })

  const pipeline = gmPipeline(readable, params)
    .selectFrame(0)

  const buffer = await gmToBuffer(pipeline, params.format)

  const previewId = `preview-${generateId()}` as Ref<Blob>
  await ctx.with('', {}, async (ctx) => {
    await storageAdapter.put(
      ctx,
      workspaceId,
      previewId,
      buffer,
      `image/${params.format}`,
      buffer.length
    )
  })

  return previewId
}
