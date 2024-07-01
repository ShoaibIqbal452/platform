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

import type { Blob, Class, Doc, MeasureContext, Ref, TxOperations } from '@hcengineering/core'
import type { PreviewSize } from '@hcengineering/preview'
import type { StorageAdapter } from '@hcengineering/server-core'

/** @public */
export interface ObjectThumbnailFuncParams {
  size?: PreviewSize
}

/** @public */
export type ObjectThumbnailFunc<T extends Doc> = (
  ctx: MeasureContext,
  client: TxOperations,
  storageAdapter: StorageAdapter,
  obj: T, params: ObjectThumbnailFuncParams
) => Promise<Ref<Blob>>

/** @public */
export type ObjectThumbnailMatchFunc<T extends Doc> = (ctx: MeasureContext, obj: T) => boolean | Promise<boolean>

/** @public */
export interface ObjectThumbnailProvider<T extends Doc = Doc> {
  objectClass: Ref<Class<T>>
  provide: ObjectThumbnailFunc<T>
  provideIf?: ObjectThumbnailMatchFunc<T>
}
