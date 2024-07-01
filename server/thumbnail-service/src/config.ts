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

/** @public */
export interface Config {
  ConfigurationDB: string
  MongoURL: string
  ServerSecret: string
  ServiceID: string
  TransactorURL: string
}

const envMap: { [key in keyof Config]: string } = {
  ConfigurationDB: 'CONFIGURATION_DB',
  MongoURL: 'MONGO_URL',
  ServerSecret: 'SERVER_SECRET',
  ServiceID: 'SERVICE_ID',
  TransactorURL: 'TRANSACTOR_URL'
}

const config: Config = (() => {
  const params: Partial<Config> = {
    ConfigurationDB: process.env[envMap.ConfigurationDB] ?? '%thumbnail',
    MongoURL: process.env[envMap.MongoURL],
    ServerSecret: process.env[envMap.ServerSecret],
    ServiceID: process.env[envMap.ServiceID] ?? 'thumbnail-service',
    TransactorURL: process.env[envMap.TransactorURL]
  }

  const missingEnv = (Object.keys(params) as Array<keyof Config>)
    .filter((key) => params[key] === undefined)
    .map((key) => envMap[key])

  if (missingEnv.length > 0) {
    throw Error(`Missing env variables: ${missingEnv.join(', ')}`)
  }

  return params as Config
})()

export default config
