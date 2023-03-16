//
// Copyright © 2020, 2021 Anticrm Platform Contributors.
// Copyright © 2021 Hardcore Engineering Inc.
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

import { Channel, Contact, Employee, getGravatarUrl, getName } from '@hcengineering/contact'
import { Class, Client, DocumentQuery, Ref, RelatedDocument, WithLookup } from '@hcengineering/core'
import { leaveWorkspace } from '@hcengineering/login-resources'
import { IntlString, Resources } from '@hcengineering/platform'
import { Avatar, getClient, getFileUrl, MessageBox, ObjectSearchResult, UserInfo } from '@hcengineering/presentation'
import { AnyComponent, AnySvelteComponent, showPopup } from '@hcengineering/ui'
import AccountArrayEditor from './components/AccountArrayEditor.svelte'
import AccountBox from './components/AccountBox.svelte'
import ChannelFilter from './components/ChannelFilter.svelte'
import Channels from './components/Channels.svelte'
import ChannelsDropdown from './components/ChannelsDropdown.svelte'
import ChannelsEditor from './components/ChannelsEditor.svelte'
import ChannelsPresenter from './components/ChannelsPresenter.svelte'
import ChannelsView from './components/ChannelsView.svelte'
import ContactArrayEditor from './components/ContactArrayEditor.svelte'
import ContactPresenter from './components/ContactPresenter.svelte'
import ContactRefPresenter from './components/ContactRefPresenter.svelte'
import Contacts from './components/Contacts.svelte'
import ContactsTabs from './components/ContactsTabs.svelte'
import CreateEmployee from './components/CreateEmployee.svelte'
import CreateOrganization from './components/CreateOrganization.svelte'
import CreatePerson from './components/CreatePerson.svelte'
import EditEmployee from './components/EditEmployee.svelte'
import EditMember from './components/EditMember.svelte'
import EditOrganization from './components/EditOrganization.svelte'
import EditPerson from './components/EditPerson.svelte'
import EmployeeAccountPresenter from './components/EmployeeAccountPresenter.svelte'
import EmployeeAccountRefPresenter from './components/EmployeeAccountRefPresenter.svelte'
import EmployeeArrayEditor from './components/EmployeeArrayEditor.svelte'
import EmployeeBrowser from './components/EmployeeBrowser.svelte'
import EmployeeEditor from './components/EmployeeEditor.svelte'
import EmployeePresenter from './components/EmployeePresenter.svelte'
import EmployeeRefPresenter from './components/EmployeeRefPresenter.svelte'
import MemberPresenter from './components/MemberPresenter.svelte'
import Members from './components/Members.svelte'
import MembersPresenter from './components/MembersPresenter.svelte'
import MergeEmployee from './components/MergeEmployee.svelte'
import OrganizationEditor from './components/OrganizationEditor.svelte'
import OrganizationPresenter from './components/OrganizationPresenter.svelte'
import PersonEditor from './components/PersonEditor.svelte'
import PersonPresenter from './components/PersonPresenter.svelte'
import PersonRefPresenter from './components/PersonRefPresenter.svelte'
import SocialEditor from './components/SocialEditor.svelte'
import contact from './plugin'
import {
  employeeSort,
  filterChannelInResult,
  filterChannelNinResult,
  getContactLink,
  getContactName,
  getCurrentEmployeeEmail,
  getCurrentEmployeeName,
  resolveLocation
} from './utils'

export {
  Channels,
  ChannelsEditor,
  ContactPresenter,
  ChannelsView,
  ChannelsDropdown,
  EmployeePresenter,
  PersonPresenter,
  OrganizationPresenter,
  EmployeeBrowser,
  MemberPresenter,
  EmployeeEditor,
  EmployeeAccountRefPresenter,
  MembersPresenter,
  EditPerson,
  EmployeeRefPresenter,
  AccountArrayEditor,
  AccountBox
}

const toObjectSearchResult = (e: WithLookup<Contact>): ObjectSearchResult => ({
  doc: e,
  title: getName(e),
  icon: Avatar,
  iconProps: { size: 'x-small', avatar: e.avatar },
  component: UserInfo,
  componentProps: { size: 'x-small' }
})

async function queryContact (
  _class: Ref<Class<Contact>>,
  client: Client,
  search: string,
  filter?: { in?: RelatedDocument[], nin?: RelatedDocument[] }
): Promise<ObjectSearchResult[]> {
  let q: DocumentQuery<Contact> = { name: { $like: `%${search}%` } }
  if (_class === contact.class.Employee) q = { ...q, active: true }
  if (filter?.in !== undefined || filter?.nin !== undefined) {
    q._id = {}
    if (filter.in !== undefined) {
      q._id.$in = filter.in?.map((it) => it._id as Ref<Contact>)
    }
    if (filter.nin !== undefined) {
      q._id.$nin = filter.nin?.map((it) => it._id as Ref<Contact>)
    }
  }
  return (await client.findAll(_class, q, { limit: 200 })).map(toObjectSearchResult)
}

async function kickEmployee (doc: Employee): Promise<void> {
  const client = getClient()
  const email = await client.findOne(contact.class.EmployeeAccount, { employee: doc._id })
  if (email === undefined) {
    await client.update(doc, { active: false })
  } else {
    showPopup(
      MessageBox,
      {
        label: contact.string.KickEmployee,
        message: contact.string.KickEmployeeDescr
      },
      undefined,
      (res?: boolean) => {
        if (res === true) {
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          leaveWorkspace(email.email)
        }
      }
    )
  }
}
async function openChannelURL (doc: Channel): Promise<void> {
  if (doc.value.startsWith('http://') || doc.value.startsWith('https://')) {
    window.open(doc.value)
  }
}

export interface PersonLabelTooltip {
  personLabel?: IntlString
  placeholderLabel?: IntlString
  component?: AnySvelteComponent | AnyComponent
  props?: any
}

export default async (): Promise<Resources> => ({
  actionImpl: {
    KickEmployee: kickEmployee,
    OpenChannel: openChannelURL
  },
  component: {
    ContactArrayEditor,
    PersonEditor,
    OrganizationEditor,
    ContactPresenter,
    ContactRefPresenter,
    PersonRefPresenter,
    PersonPresenter,
    OrganizationPresenter,
    ChannelsPresenter,
    CreatePerson,
    CreateOrganization,
    EditPerson,
    EditEmployee,
    EditOrganization,
    SocialEditor,
    Contacts,
    ContactsTabs,
    EmployeeAccountPresenter,
    EmployeePresenter,
    EmployeeRefPresenter,
    Members,
    MemberPresenter,
    MembersPresenter,
    EditMember,
    EmployeeArrayEditor,
    EmployeeEditor,
    CreateEmployee,
    AccountArrayEditor,
    ChannelFilter,
    MergeEmployee
  },
  completion: {
    EmployeeQuery: async (
      client: Client,
      query: string,
      filter?: { in?: RelatedDocument[], nin?: RelatedDocument[] }
    ) => await queryContact(contact.class.Employee, client, query, filter),
    PersonQuery: async (client: Client, query: string, filter?: { in?: RelatedDocument[], nin?: RelatedDocument[] }) =>
      await queryContact(contact.class.Person, client, query, filter),
    OrganizationQuery: async (
      client: Client,
      query: string,
      filter?: { in?: RelatedDocument[], nin?: RelatedDocument[] }
    ) => await queryContact(contact.class.Organization, client, query, filter)
  },
  function: {
    GetFileUrl: getFileUrl,
    GetGravatarUrl: getGravatarUrl,
    GetColorUrl: (uri: string) => uri,
    EmployeeSort: employeeSort,
    FilterChannelInResult: filterChannelInResult,
    FilterChannelNinResult: filterChannelNinResult,
    GetCurrentEmployeeName: getCurrentEmployeeName,
    GetCurrentEmployeeEmail: getCurrentEmployeeEmail,
    GetContactName: getContactName,
    GetContactLink: getContactLink
  },
  resolver: {
    Location: resolveLocation
  }
})
