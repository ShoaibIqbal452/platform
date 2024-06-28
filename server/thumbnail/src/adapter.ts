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

import { MeasureContext, WorkspaceId } from '@hcengineering/core'
import { getMongoClient, MongoClientReference } from '@hcengineering/mongo'
import { ObjectThumbnail } from '@hcengineering/preview'
import { Collection, Db, MongoClient } from 'mongodb'

import { ThumbnailServiceAdapter, ThumbnailRecord } from './types'

class ThumbnailServiceAdapterImpl implements ThumbnailServiceAdapter {
  private readonly thumbnailRecordCollection: Collection<ThumbnailRecord>
  private readonly db: Db
  private closed = false

  constructor (
    private readonly _client: MongoClientReference,
    private readonly client: MongoClient,
    private readonly _metrics: MeasureContext,
    private readonly dbName: string
  ) {
    this.db = client.db(dbName)
    this.thumbnailRecordCollection = this.db.collection<ThumbnailRecord>('thumbnails')
  }

  async generateThumbnail (workspace: WorkspaceId, thumbnail: ObjectThumbnail): Promise<void> {
    if (this.closed) {
      return
    }

    const collection = this.thumbnailRecordCollection

    const existing = await collection.findOne({
      workspace: workspace.name,
      thumbnail: thumbnail._id
    })

    if (existing == null) {
      const record: ThumbnailRecord = {
        workspace: workspace.name,
        thumbnail: thumbnail._id,
        objectId: thumbnail.objectId,
        objectClass: thumbnail.objectClass
      }

      await collection.insertOne(record)
    }
  }

  async close (): Promise<void> {
    this.closed = true
    this._client.close()
  }

  metrics (): MeasureContext {
    return this._metrics
  }
}

/** @public */
export async function createThumbnailAdapter (url: string, db: string, metrics: MeasureContext): Promise<ThumbnailServiceAdapter> {
  const _client = getMongoClient(url)

  return new ThumbnailServiceAdapterImpl(_client, await _client.getClient(), metrics, db)
}
