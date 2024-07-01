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
  type Blob,
  type Class,
  type Doc,
  type Hierarchy,
  type Ref,
  type Space,
  type Tx,
  type TxCreateDoc,
  type TxRemoveDoc,
  type TxUpdateDoc,
  TxProcessor,
  DocumentQuery,
  FindOptions,
  FindResult,
  TxFactory
} from '@hcengineering/core'
import drive, { type File, type Folder } from '@hcengineering/drive'
import preview, { ObjectThumbnail } from '@hcengineering/preview'
import type { TriggerControl } from '@hcengineering/server-core'

/** @public */
export async function OnFileCreate (tx: Tx, { txFactory }: TriggerControl): Promise<Tx[]> {
  const createTx = TxProcessor.extractTx(tx) as TxCreateDoc<File>

  if (createTx.attributes.path !== undefined) {
    const previewTx = createThumbnailTx(createTx.objectId, createTx.objectSpace, createTx.attributes.file, txFactory)
    if (previewTx !== undefined) {
      return [previewTx]
    }
  }

  return []
}

/** @public */
export async function OnFileUpdate (tx: Tx, { findAll, txFactory }: TriggerControl): Promise<Tx[]> {
  const updateTx = TxProcessor.extractTx(tx) as TxUpdateDoc<File>

  if (updateTx.operations.file !== undefined) {
    // TODO delete existing thumbnail

    const previewTx = createThumbnailTx(updateTx.objectId, updateTx.objectSpace, updateTx.operations.file, txFactory)
    if (previewTx !== undefined) {
      return [previewTx]
    }
  }

  return []
}

/** @public */
export async function OnFileDelete (
  tx: Tx,
  { ctx, findAll, removedMap, storageAdapter, workspace, txFactory }: TriggerControl
): Promise<Tx[]> {
  const rmTx = TxProcessor.extractTx(tx) as TxRemoveDoc<File>

  const txes = []

  // Remove blobs for removed files
  const attach = removedMap.get(rmTx.objectId) as File
  if (attach !== undefined) {
    const thumbnails = await findAll(preview.class.ObjectThumbnail, {
      objectClass: core.class.Blob,
      objectId: attach.file
    })
    for (const thumbnail of thumbnails) {
      if (!removedMap.has(thumbnail._id)) {
        txes.push(removeThumbnailTx(thumbnail.space, thumbnail._id, txFactory))
      }
    }

    const toRemove = []

    if (attach.file !== undefined) {
      toRemove.push(attach.file)
    }

    if (toRemove.length > 0) {
      await storageAdapter.remove(ctx, workspace, toRemove)
    }
  }

  return txes
}

/**
 * @public
 */
export async function FindFolderResources (
  doc: Doc,
  hiearachy: Hierarchy,
  findAll: <T extends Doc>(
    clazz: Ref<Class<T>>,
    query: DocumentQuery<T>,
    options?: FindOptions<T>
  ) => Promise<FindResult<T>>
): Promise<Doc[]> {
  const folder = doc as Folder

  const files = await findAll(drive.class.File, { parent: folder._id })
  const folders = await findAll(drive.class.Folder, { parent: folder._id })
  return [...files, ...folders]
}

function createThumbnailTx (
  _id: Ref<File>,
  space: Ref<Space>,
  file: Ref<Blob>,
  txFactory: TxFactory
): Tx {
  return txFactory.createTxCreateDoc(
    preview.class.ObjectThumbnail,
    space,
    {
      objectId: file,
      objectClass: core.class.Blob
    }
  )
}

function removeThumbnailTx (
  space: Ref<Space>,
  thumbnail: Ref<ObjectThumbnail>,
  txFactory: TxFactory
): Tx {
  return txFactory.createTxRemoveDoc(preview.class.ObjectThumbnail, space, thumbnail)
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export default async () => ({
  trigger: {
    OnFileCreate,
    OnFileUpdate,
    OnFileDelete
  },
  function: {
    FindFolderResources
  }
})
