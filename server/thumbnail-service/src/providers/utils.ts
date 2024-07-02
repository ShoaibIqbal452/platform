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

import gm from 'gm'

const gmtool = gm.subClass({ imageMagick: false })

/** @public */
export async function gmToBuffer (state: gm.State, format: string): Promise<Buffer> {
  return await new Promise((resolve, reject) => {
    state.toBuffer(format, (err, buffer) => {
      if (err != null) {
        reject(err)
      }
      resolve(buffer)
    })
  })
}

/** @public */
export function gmPipeline (
  stream: NodeJS.ReadableStream | Buffer,
  params: { width: number, height: number, format: string }
): gm.State {
  return gmtool(stream)
    .resize(params.width, undefined, '>')
    .crop(params.width, params.height)
    .gravity('NorthWest')
}
