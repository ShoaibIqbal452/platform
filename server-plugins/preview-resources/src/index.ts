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
  type Class,
  type Doc,
  type Hierarchy,
  type Ref,
  type Tx,
  type TxCreateDoc,
  DocumentQuery,
  FindOptions,
  FindResult,
  TxProcessor,
  TxRemoveDoc
} from '@hcengineering/core'
import preview, { type ObjectThumbnail } from '@hcengineering/preview'
import { type TriggerControl } from '@hcengineering/server-core'
import { type ThumbnailServiceAdapter, serverThumbnailId } from '@hcengineering/thumbnail'

/** @public */
export async function OnObjectCreate (tx: Tx, control: TriggerControl): Promise<Tx[]> {
  const hierarchy = control.hierarchy

  const createTx = TxProcessor.extractTx(tx) as TxCreateDoc<Doc>
  if (createTx._class !== core.class.TxCreateDoc) return []
  if (hierarchy.isDerived(createTx.objectClass, preview.class.ObjectThumbnail)) return []

  const mixin = hierarchy.classHierarchyMixin(createTx.objectClass, preview.mixin.ObjectThumbnailPreview)
  if (mixin !== undefined) {
    const thumbnailTx = control.txFactory.createTxCreateDoc(
      preview.class.ObjectThumbnail,
      createTx.space,
      {
        objectId: createTx.objectId,
        objectClass: createTx.objectClass
      }
    )
    return [thumbnailTx]
  }

  return []
}

/** @public */
export async function OnObjectThumbnailCreate (tx: Tx, control: TriggerControl): Promise<Tx[]> {
  const createTx = TxProcessor.extractTx(tx) as TxCreateDoc<ObjectThumbnail>
  if (createTx._class !== core.class.TxCreateDoc) return []

  const adapter = control.serviceAdaptersManager.getAdapter(serverThumbnailId) as ThumbnailServiceAdapter
  if (adapter !== undefined) {
    const thumbnail = TxProcessor.createDoc2Doc(createTx, false)
    await adapter.generateThumbnail(control.workspace, thumbnail)
  }

  return []
}

/** @public */
export async function OnObjectThumbnailRemove (tx: Tx, control: TriggerControl): Promise<Tx[]> {
  const removeTx = TxProcessor.extractTx(tx) as TxRemoveDoc<ObjectThumbnail>
  if (removeTx._class !== core.class.TxRemoveDoc) return []

  const thumbnail = control.removedMap.get(removeTx.objectId) as ObjectThumbnail
  if (thumbnail?.thumbnail != null) {
    await control.storageAdapter.remove(control.ctx, control.workspace, [thumbnail.thumbnail])
  }

  return []
}

/** @public */
export async function ObjectThumbnailRemove (
  doc: Doc,
  hiearachy: Hierarchy,
  findAll: <T extends Doc>(
    clazz: Ref<Class<T>>,
    query: DocumentQuery<T>,
    options?: FindOptions<T>
  ) => Promise<FindResult<T>>
): Promise<Doc[]> {
  if (hiearachy.isDerived(doc._class, preview.class.ObjectThumbnail)) return []

  return await findAll(preview.class.ObjectThumbnail, { objectId: doc._id, objectClass: doc._class })
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export default async () => ({
  trigger: {
    OnObjectCreate,
    OnObjectThumbnailCreate,
    OnObjectThumbnailRemove
  },
  function: {
    ObjectThumbnailRemove
  }
})
