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

import type { Doc, TxOperations } from '@hcengineering/core'

import preview from './plugin'

export async function requestObjectThumbnail (client: TxOperations, doc: Doc): Promise<void> {
  const { _id: objectId, _class: objectClass, space } = doc

  const ops = client.apply(objectId)
  const current = await ops.findOne(preview.class.ObjectThumbnail, { objectId, objectClass })

  if (current !== undefined) {
    // do nothing
    // await ops.update(current, { thumbnail: null })
  } else {
    await ops.createDoc(
      preview.class.ObjectThumbnail,
      space,
      { objectId, objectClass }
    )
  }
  await ops.commit()
}
