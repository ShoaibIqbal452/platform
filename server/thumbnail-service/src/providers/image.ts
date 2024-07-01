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

import core, { type Blob, type MeasureContext, type Ref, type TxOperations } from '@hcengineering/core'
import { type StorageAdapter } from '@hcengineering/server-core'

import { type ObjectThumbnailFuncParams, type ObjectThumbnailProvider } from '../types'

/** @public */
export const provider: ObjectThumbnailProvider<Blob> = {
  objectClass: core.class.Blob,
  provideIf,
  provide
}

function provideIf (ctx: MeasureContext, obj: Blob): boolean | Promise<boolean> {
  return obj.contentType.startsWith('image/')
}

async function provide (
  ctx: MeasureContext,
  client: TxOperations,
  storageAdapter: StorageAdapter,
  obj: Blob,
  params: ObjectThumbnailFuncParams
): Promise<Ref<Blob>> {
  // do nothing, just return the same blob
  return obj._id
}
