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

import {
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
import type { TriggerControl } from '@hcengineering/server-core'

/** @public */
export async function OnFileCreate (tx: Tx, { txFactory }: TriggerControl): Promise<Tx[]> {
  const createTx = TxProcessor.extractTx(tx) as TxCreateDoc<File>

  if (createTx.attributes.path !== undefined) {
    const previewTx = generatePreviewTx(createTx.objectId, createTx.objectSpace, createTx.attributes.file, txFactory)
    if (previewTx !== undefined) {
      return [previewTx]
    }
  }

  return []
}

/** @public */
export async function OnFileUpdate (tx: Tx, { txFactory }: TriggerControl): Promise<Tx[]> {
  const updateTx = TxProcessor.extractTx(tx) as TxUpdateDoc<File>

  if (updateTx.operations.file !== undefined) {
    const previewTx = generatePreviewTx(updateTx.objectId, updateTx.objectSpace, updateTx.operations.file, txFactory)
    if (previewTx !== undefined) {
      return [previewTx]
    }
  }

  return []
}

/** @public */
export async function OnFileDelete (
  tx: Tx,
  { removedMap, ctx, storageAdapter, workspace }: TriggerControl
): Promise<Tx[]> {
  const rmTx = TxProcessor.extractTx(tx) as TxRemoveDoc<File>

  // Remove blobs for removed files
  const attach = removedMap.get(rmTx.objectId) as File
  if (attach !== undefined) {
    const toRemove = []
    if (attach.file !== undefined) {
      toRemove.push(attach.file)
    }
    if (attach.preview !== undefined) {
      toRemove.push(attach.preview)
    }
    if (toRemove.length > 0) {
      await storageAdapter.remove(ctx, workspace, toRemove)
    }
  }

  return []
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

function generatePreviewTx (
  _id: Ref<File>,
  space: Ref<Space>,
  file: Ref<Blob>,
  txFactory: TxFactory
): Tx {
  // TODO trigger preview generation
  return txFactory.createTxUpdateDoc(
    drive.class.File,
    space,
    _id,
    { preview: file }
  )
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
