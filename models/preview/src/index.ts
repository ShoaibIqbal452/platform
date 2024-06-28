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

import { type Blob, type Class, type Doc, type Domain, type Ref, DOMAIN_MODEL, IndexKind } from '@hcengineering/core'
import { type Builder, Model, Prop, TypeRef, Index } from '@hcengineering/model'
import core, { TClass, TDoc } from '@hcengineering/model-core'
import {
  type ObjectPreview,
  type ObjectThumbnail,
  type ObjectThumbnailFunc,
  type ObjectThumbnailMatchFunc,
  type ObjectThumbnailProvider
} from '@hcengineering/preview'
import { type Resource } from '@hcengineering/platform'
import { type AnyComponent } from '@hcengineering/ui'

import preview from './plugin'

export { previewId } from '@hcengineering/preview'
export { preview as default }

export const DOMAIN_PREVIEW = 'preview' as Domain

@Model(preview.mixin.ObjectPreview, core.class.Class, DOMAIN_MODEL)
export class TObjectPreview extends TClass implements ObjectPreview {
  presenter!: AnyComponent
}

@Model(preview.class.ObjectThumbnail, core.class.Doc, DOMAIN_PREVIEW)
export class TObjectThumbnail extends TDoc implements ObjectThumbnail {
  @Prop(TypeRef(core.class.Doc), core.string.Object)
  @Index(IndexKind.Indexed)
    objectId!: Ref<Doc>

  @Prop(TypeRef(core.class.Class), core.string.Class)
    objectClass!: Ref<Class<Doc>>

  @Prop(TypeRef(core.class.Blob), preview.string.Preview)
    thumbnail!: Ref<Blob>
}

@Model(preview.class.ObjectThumbnailProvider, core.class.Doc, DOMAIN_MODEL)
export class TObjectThumbnailProvider extends TDoc implements ObjectThumbnailProvider {
  objectClass!: Ref<Class<Doc>>
  provide!: Resource<ObjectThumbnailFunc<Doc>>
  provideIf?: Resource<ObjectThumbnailMatchFunc<Doc>>
}

export function createModel (builder: Builder): void {
  builder.createModel(TObjectPreview, TObjectThumbnail, TObjectThumbnailProvider)

  builder.mixin(core.class.Blob, core.class.Class, preview.mixin.ObjectPreview, {
    presenter: preview.component.ObjectThumbnailPreview
  })
}
