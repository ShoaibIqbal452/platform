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
  import { type Doc, type WithLookup } from '@hcengineering/core'
  import { getBlobRef, sizeToWidth } from '@hcengineering/presentation'
  import { ObjectThumbnail, type PreviewSize } from '@hcengineering/preview'

  import preview from '../plugin'

  export let object: WithLookup<Doc>
  export let size: PreviewSize = 'large'
  export let thumbnail: WithLookup<ObjectThumbnail>

  $: blob = thumbnail.$lookup?.thumbnail
  $: blobRef = thumbnail.thumbnail
</script>

{#if blobRef}
  {#await getBlobRef(blob, blobRef, undefined, sizeToWidth(size)) then blobSrc}
    <img
      class="img-fit"
      src={blobSrc.src}
      srcset={blobSrc.srcset}
      alt={preview.string.Preview}
    />
  {/await}
{/if}

<style lang="scss">
  .img-fit {
    object-fit: cover;
    height: 100%;
    width: 100%;
  }
</style>
