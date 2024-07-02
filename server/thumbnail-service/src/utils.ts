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

import type { Doc, MeasureContext, TxOperations, WorkspaceId } from '@hcengineering/core'
import type { StorageAdapter } from '@hcengineering/server-core'

import type { ObjectThumbnailFunc, ObjectThumbnailFuncParams } from './types'

/** @public */
export function withContext<T extends Doc> (context: string, func: ObjectThumbnailFunc<T>): ObjectThumbnailFunc<T> {
  return async (
    ctx: MeasureContext,
    client: TxOperations,
    storageAdapter: StorageAdapter,
    workspaceId: WorkspaceId,
    obj: T,
    params: ObjectThumbnailFuncParams
  ) => {
    return await ctx.with(context, {}, async (ctx) => {
      return await func(ctx, client, storageAdapter, workspaceId, obj, params)
    })
  }
}
