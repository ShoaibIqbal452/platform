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

import core, { Client, TxOperations, WorkspaceId, systemAccountEmail, toWorkspaceString } from '@hcengineering/core'
import client from '@hcengineering/client'
import clientResources from '@hcengineering/client-resources'
import { setMetadata } from '@hcengineering/platform'
import { generateToken } from '@hcengineering/server-token'

import config from './config'

const AUTO_CLOSE_INTERVAL_MS = 10 * 60 * 1000

// eslint-disable-next-line
const WebSocket = require('ws')

/** @public */
export async function connect (token: string): Promise<Client> {
  // We need to override default factory with 'ws' one.
  setMetadata(client.metadata.ClientSocketFactory, (url) => {
    return new WebSocket(url, {
      headers: {
        'User-Agent': config.ServiceID
      }
    })
  })
  return await (await clientResources()).function.GetClient(token, config.TransactorURL)
}

/** @public */
export class WorkspaceClientPool {
  private readonly workspaces: Map<string, WorkspaceClient> = new Map<string, WorkspaceClient>()
  private readonly timeouts: Map<string, NodeJS.Timeout> = new Map<string, NodeJS.Timeout>()

  async getClient (workspaceId: WorkspaceId): Promise<WorkspaceClient> {
    const workspace = toWorkspaceString(workspaceId)

    let client = this.workspaces.get(workspace)
    if (client === undefined) {
      client = await WorkspaceClient.create(workspaceId)
      this.workspaces.set(workspace, client)
    }

    const timeout = this.timeouts.get(workspace)
    if (timeout !== undefined) {
      clearTimeout(timeout)
      this.timeouts.delete(workspace)
    }

    const callback = () => void this.closeClient(workspaceId)
    this.timeouts.set(workspace, setTimeout(callback, AUTO_CLOSE_INTERVAL_MS))

    return client
  }

  async closeClient (workspaceId: WorkspaceId): Promise<void> {
    const workspace = toWorkspaceString(workspaceId)

    const timeout = this.timeouts.get(workspace)
    if (timeout !== undefined) {
      clearTimeout(timeout)
      this.timeouts.delete(workspace)
    }

    const client = this.workspaces.get(workspace)
    if (client !== undefined) {
      await client.close()
      this.workspaces.delete(workspace)
    }
  }

  async close (): Promise<void> {
    for (const timeout of this.timeouts.values()) {
      clearTimeout(timeout)
    }
    this.timeouts.clear()

    for (const workspace of this.workspaces.values()) {
      await workspace.close()
    }
    this.workspaces.clear()
  }
}

/** @public */
export class WorkspaceClient {
  private constructor (
    readonly workspace: WorkspaceId,
    readonly client: Client
  ) {}

  static async create (workspace: WorkspaceId): Promise<WorkspaceClient> {
    const token = generateToken(systemAccountEmail, workspace)
    const client = await connect(token)
    return new WorkspaceClient(workspace, client)
  }

  txOperations (): TxOperations {
    return new TxOperations(this.client, core.account.System)
  }

  async close (): Promise<void> {
    await this.client.close()
  }
}
