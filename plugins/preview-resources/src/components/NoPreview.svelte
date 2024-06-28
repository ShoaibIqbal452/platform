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
  import { type PreviewSize } from '@hcengineering/preview'
  import { Label } from '@hcengineering/ui'

  import preview from '../plugin'

  export let object: WithLookup<Doc>
  export let size: PreviewSize = 'large'
</script>

{#if $$slots.default !== undefined}
  <slot />
{:else}
  <div class="flex-col-center w-full">
    <Label label={preview.string.NoPreview}/>
  </div>
{/if}
