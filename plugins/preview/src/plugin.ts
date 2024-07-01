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

import type { Class, Mixin, Ref } from '@hcengineering/core'
import type { Plugin } from '@hcengineering/platform'
import { plugin } from '@hcengineering/platform'
import type { AnyComponent } from '@hcengineering/ui'
import type { ObjectPreview, ObjectThumbnail, ObjectThumbnailPreview, ObjectThumbnailProvider } from './types'

export * from './types'

/** @public */
export const previewId = 'preview' as Plugin

export const previewPlugin = plugin(previewId, {
  component: {
    ObjectPreview: '' as AnyComponent,
    ObjectThumbnailPreview: '' as AnyComponent
  },
  class: {
    ObjectThumbnail: '' as Ref<Class<ObjectThumbnail>>,
    ObjectThumbnailProvider: '' as Ref<Class<ObjectThumbnailProvider>>
  },
  icon: {},
  mixin: {
    ObjectPreview: '' as Ref<Mixin<ObjectPreview>>,
    ObjectThumbnailPreview: '' as Ref<Mixin<ObjectThumbnailPreview>>
  }
})

export default previewPlugin
