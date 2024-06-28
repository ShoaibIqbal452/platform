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

import type { Blob, Class, Doc, Ref } from '@hcengineering/core'
import { Resource } from '@hcengineering/platform'
import type { AnyComponent } from '@hcengineering/ui'

/** @public */
export type PreviewSize = 'small' | 'medium' | 'large' | 'x-large'

/** @public */
export interface ObjectPreview extends Class<Doc> {
  presenter: AnyComponent
}

/** @public */
export type ObjectThumbnailMatchFunc<T extends Doc> = (obj: T) => boolean | Promise<boolean>

/** @public */
export type ObjectThumbnailFunc<T extends Doc> = (obj: T) => Promise<Ref<Blob>>

/** @public */
export interface ObjectThumbnailProvider extends Doc {
  objectClass: Ref<Class<Doc>>
  provide: Resource<ObjectThumbnailFunc<Doc>>
  provideIf?: Resource<ObjectThumbnailMatchFunc<Doc>>
}

/** @public */
export interface ObjectThumbnail extends Doc {
  objectId: Ref<Doc>
  objectClass: Ref<Class<Doc>>
  thumbnail?: Ref<Blob> | null
}
