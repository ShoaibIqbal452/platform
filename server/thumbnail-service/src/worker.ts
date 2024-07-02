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

import type { Doc, MeasureContext, Space, WithLookup } from '@hcengineering/core'
import { getWorkspaceId } from '@hcengineering/core'
import preview from '@hcengineering/preview'
import type { StorageAdapter } from '@hcengineering/server-core'
import type { ThumbnailRecord } from '@hcengineering/thumbnail'

import { WorkspaceClientPool } from './platform'
import type { ObjectThumbnailFuncParams, ObjectThumbnailProvider } from './types'

/** @public */
export class Worker {
  private readonly clients: WorkspaceClientPool

  constructor (
    private readonly storageAdapter: StorageAdapter,
    private readonly providers: ObjectThumbnailProvider[],
    private readonly params: ObjectThumbnailFuncParams
  ) {
    this.clients = new WorkspaceClientPool()
  }

  async close (): Promise<void> {
    await this.clients.close()
  }

  async processThumbnailRecord (ctx: MeasureContext, thumbnail: ThumbnailRecord): Promise<boolean> {
    const workspaceId = getWorkspaceId(thumbnail.workspace)
    const client = await this.clients.getClient(workspaceId)
    const ops = client.txOperations()

    const object = await ctx.with('query-object', {}, async () => {
      return await ops.findOne(thumbnail.objectClass, { _id: thumbnail.objectId })
    })

    if (object === undefined) {
      // cannot process object, no object
      return false
    }

    const provider = await ctx.with('find-provider', {}, async (ctx) => {
      return await this.findThumbnailProvider(ctx, object)
    })

    if (provider === undefined) {
      // cannot process object, no provider
      return false
    }

    // found a provider, generate blob
    const blob = await ctx.with('provide', {}, async (ctx) => {
      return await provider.provide(ctx, ops, this.storageAdapter, workspaceId, object, this.params)
    })

    await ops.updateDoc(
      preview.class.ObjectThumbnail,
      object.space,
      thumbnail.thumbnail,
      {
        thumbnail: blob
      }
    )

    return true
  }

  private async findThumbnailProvider (
    ctx: MeasureContext,
    object: WithLookup<Doc<Space>>
  ): Promise<ObjectThumbnailProvider | undefined> {
    const providers = this.providers.filter((p) => p.objectClass === object._class)

    if (providers.length === 0) {
      // cannot process object, no providers
      ctx.warn('no thumbnail providers regitered for object class', { objectClass: object._class })
      return undefined
    }

    try {
      for (const provider of providers) {
        if (provider.provideIf == null) {
          return provider
        }

        const provideIf = provider.provideIf(ctx, object)
        const doProvide = provideIf instanceof Promise ? await provideIf : provideIf
        if (doProvide) {
          return provider
        }
      }
    } catch (err) {
      ctx.error('failed to match thumbnail provider', { err, objectClass: object._class, objectId: object._id })
    }

    ctx.warn('no thumbnail provider found for object', { objectClass: object._class, objectId: object._id })
    return undefined
  }
}
