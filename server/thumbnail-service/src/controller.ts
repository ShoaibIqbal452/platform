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

import type { MeasureContext } from '@hcengineering/core'
import type { StorageAdapter } from '@hcengineering/server-core'
import type { ThumbnailRecord } from '@hcengineering/thumbnail'
import type { Db, Collection } from 'mongodb'

import type { Config } from './config'
import { ObjectThumbnailProvider } from './types'
import { Worker } from './worker'

/** @public */
export type CloseFunc = () => Promise<void>

/** @public */
export class Controller {
  private readonly collection: Collection<ThumbnailRecord>
  private readonly worker: Worker
  private stopped = false
  private running: Promise<void> | undefined

  constructor (
    private readonly ctx: MeasureContext,
    private readonly config: Config,
    private readonly storageAdapter: StorageAdapter,
    private readonly providers: ObjectThumbnailProvider[],
    private readonly db: Db
  ) {
    this.collection = db.collection<ThumbnailRecord>('thumbnails')
    this.worker = new Worker(storageAdapter, providers)
  }

  async start (): Promise<void> {
    const ctx = this.ctx

    if (this.running === undefined) {
      ctx.info('starting thumbnail controller')
      this.stopped = false
      this.running = this.processThumbnails()
    }
  }

  async close (): Promise<void> {
    this.ctx.info('stopping thumbnail controller')
    if (this.running !== undefined) {
      this.stopped = true
      await this.running
    }
  }

  private async processThumbnails (): Promise<void> {
    const ctx = this.ctx

    while (!this.stopped) {
      const thumbnail = await this.collection.findOne()

      if (thumbnail != null) {
        try {
          await ctx.with('process-thumbnail', {}, async (ctx) => {
            await this.processThumbnail(ctx, thumbnail)
          })
        } finally {
          await this.collection.deleteOne({ _id: thumbnail._id })
        }
      } else {
        await new Promise((resolve) => setTimeout(resolve, 500))
      }
    }
  }

  private async processThumbnail (ctx: MeasureContext, thumbnail: ThumbnailRecord): Promise<void> {
    try {
      await ctx.with('process-thumbnail', {}, async (ctx) => {
        await this.worker.processThumbnailRecord(ctx, thumbnail)
      })
    } catch (err) {
      ctx.error('failed to process thumbnail', { err, objectClass: thumbnail.objectClass })
    }
  }
}
