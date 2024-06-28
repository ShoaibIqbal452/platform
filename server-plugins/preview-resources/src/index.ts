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
  DocumentQuery,
  FindOptions,
  FindResult
} from '@hcengineering/core'
import preview, { type ObjectThumbnail } from '@hcengineering/preview'

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

/** @public */
export async function ObjectThumbnailBlobRemove (
  doc: Doc,
  hiearachy: Hierarchy,
  findAll: <T extends Doc>(
    clazz: Ref<Class<T>>,
    query: DocumentQuery<T>,
    options?: FindOptions<T>
  ) => Promise<FindResult<T>>
): Promise<Doc[]> {
  if (hiearachy.isDerived(doc._class, preview.class.ObjectThumbnail)) {
    const blob = (doc as ObjectThumbnail).thumbnail
    if (blob != null) {
      return await findAll(core.class.Blob, { _id: blob })
    }
  }

  return []
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export default async () => ({
  function: {
    ObjectThumbnailRemove,
    ObjectThumbnailBlobRemove
  }
})
