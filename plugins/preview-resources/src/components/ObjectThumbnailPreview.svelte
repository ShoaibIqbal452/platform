<!--
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
-->

<script lang="ts">
  import core, { type Doc, type WithLookup } from '@hcengineering/core'
  import { getClient } from '@hcengineering/presentation'
  import preview, { type ObjectThumbnail, type PreviewSize } from '@hcengineering/preview'

  import ObjectThumbnailPresenter from './ObjectThumbnailPresenter.svelte'

  export let object: WithLookup<Doc>
  export let size: PreviewSize = 'large'

  const client = getClient()

  let thumbnail: ObjectThumbnail | undefined

  $: void fetchThumbnail(object)

  async function fetchThumbnail (object: Doc): Promise<void> {
    thumbnail = await client.findOne(
      preview.class.ObjectThumbnail,
      {
        objectId: object._id,
        objectClass: object._class
      },
      {
        lookup: {
          thumbnail: core.class.Blob
        }
      }
    )
  }
</script>

{#if thumbnail}
  <ObjectThumbnailPresenter {object} {size} {thumbnail} />
{:else}
  <slot />
{/if}
