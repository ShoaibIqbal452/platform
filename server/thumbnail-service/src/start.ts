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

import type { MeasureContext } from '@hcengineering/core'
import { getMongoClient } from '@hcengineering/mongo'
import { setMetadata } from '@hcengineering/platform'
import { buildStorageFromConfig, storageConfigFromEnv } from '@hcengineering/server-storage'
import serverToken from '@hcengineering/server-token'

import config from './config'
import { Controller } from './controller'
import { providers } from './providers'
import type { ObjectThumbnailFuncParams } from './types'

export const start = async (ctx: MeasureContext, onClose?: () => void): Promise<void> => {
  setMetadata(serverToken.metadata.Secret, config.ServerSecret)

  const params: ObjectThumbnailFuncParams = { width: 1024, height: 1024, format: 'png' }

  const storageConfiguration = storageConfigFromEnv()
  const storageAdapter = buildStorageFromConfig(storageConfiguration, config.MongoURL)

  const mongoRef = getMongoClient(config.MongoURL)
  const mongoClient = await mongoRef.getClient()

  const db = mongoClient.db(config.ConfigurationDB)

  const controller = new Controller(ctx, config, storageAdapter, db, providers, params)

  await controller.start()

  const close = (): void => {
    void controller.close()
    void storageAdapter.close()
    mongoRef.close()
    onClose?.()
  }

  process.on('SIGINT', close)
  process.on('SIGTERM', close)
  process.on('uncaughtException', (e: Error) => {
    console.error(e)
  })
  process.on('unhandledRejection', (e: Error) => {
    console.error(e)
  })
}
