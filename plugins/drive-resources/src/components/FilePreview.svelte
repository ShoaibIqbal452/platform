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
  import { type WithLookup } from '@hcengineering/core'
  import { type File } from '@hcengineering/drive'
  import preview, { type PreviewSize } from '@hcengineering/preview'
  import { Component } from '@hcengineering/ui'

  export let object: WithLookup<File>
  export let size: PreviewSize = 'large'

  $: blob = object.$lookup?.file

  function extensionIconLabel (name: string): string {
    const parts = name.split('.')
    const ext = parts[parts.length - 1]
    return ext.substring(0, 4).toUpperCase()
  }
</script>

{#if blob !== undefined}
  <Component
    is={preview.component.ObjectThumbnailPreview}
    props={{ object: blob, size }}
  >
    <div class="flex-center ext-icon">
      {extensionIconLabel(object.name)}
    </div>
  </Component>
{/if}

<style lang="scss">
  .ext-icon {
    flex-shrink: 0;
    width: 2rem;
    height: 2rem;
    font-weight: 500;
    font-size: 0.625rem;
    color: var(--primary-button-color);
    background-color: var(--primary-button-default);
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: 0.5rem;
  }
</style>
