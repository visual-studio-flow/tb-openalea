import type * as CodeApiModule from '@mkdocs-ts/code-api'
import type * as NotebookModule from '@mkdocs-ts/notebook'
import * as webpm from '@w3nest/webpm-client'
import {
    Navigation,
    DefaultLayout,
    Router,
    ViewGenerator,
    MdWidgets,
} from 'mkdocs-ts'
import pkJson from '../../package.json'

import LinksDict from './links.json'

const mkdocsApiVersion = pkJson.webpm.dependencies['@mkdocs-ts/code-api']
const mkdocsNotebookVersion = pkJson.webpm.dependencies['@mkdocs-ts/notebook']

export async function installCodeApiModule() {
    const { CodeApi } = await webpm.install<{
        CodeApi: typeof CodeApiModule
    }>({
        esm: [`@mkdocs-ts/code-api#${mkdocsApiVersion} as CodeApi`],
        css: [`@mkdocs-ts/code-api#${mkdocsApiVersion}~assets/ts-typedoc.css`],
    })
    return CodeApi
}

export async function installNotebookModule() {
    const { Notebook } = await webpm.install<{
        Notebook: typeof NotebookModule
    }>({
        esm: [`@mkdocs-ts/notebook#${mkdocsNotebookVersion} as Notebook`],
        css: [
            `@mkdocs-ts/notebook#${mkdocsNotebookVersion}~assets/notebook.css`,
        ],
    })
    return Notebook
}

const baseUrl = webpm.getUrlBase(pkJson.name, pkJson.version)

export const url = (restOfPath: string) => `${baseUrl}/assets/${restOfPath}`

const placeholders = {}
export const notebookPage = async (target: string, router: Router) => {
    const Notebook = await installNotebookModule()

    const notebookOptions = {
        runAtStart: true,
        defaultCellAttributes: {
            lineNumbers: false,
        },
        markdown: {
            latex: true,
            placeholders,
        },
    }

    return new Notebook.NotebookPage({
        url: url(target),
        router,
        options: notebookOptions,
        initialScope: {
            const: {
                webpm,
            },
            let: {},
        },
    })
}

export interface RootModulesNav {
    self: string
    'vsf-core': string
}
export type LibNav = Navigation<
    DefaultLayout.NavLayout,
    DefaultLayout.NavHeader
>

export async function apiNav({
    rootModulesNav,
    displayVsfProject,
}: {
    rootModulesNav: RootModulesNav
    displayVsfProject: (
        nbModule: typeof NotebookModule,
    ) => NotebookModule.DisplayComponent<unknown>
}): Promise<LibNav> {
    const CodeApiModule = await installCodeApiModule()
    const NotebookModule = await installNotebookModule()
    const displayFactory: NotebookModule.DisplayFactory = [
        displayVsfProject(NotebookModule),
    ]
    const hostMappers = {
        api: MdWidgets.ApiLink.Mapper,
        ext: MdWidgets.ExtLink.Mapper,
        github: MdWidgets.GitHubLink.Mapper,
        cross: MdWidgets.CrossLink.Mapper,
    }
    MdWidgets.ApiLink.Mapper = (target: string, elem) => {
        if (LinksDict.apiLinks[target]) {
            return {
                href: LinksDict.apiLinks[target] as string,
            }
        }
        return hostMappers.api(target, elem)
    }
    MdWidgets.ExtLink.Mapper = (target: string, elem) => {
        if (LinksDict.extLinks[target]) {
            return {
                href: LinksDict.extLinks[target] as string,
            }
        }
        return hostMappers.ext(target, elem)
    }
    MdWidgets.GitHubLink.Mapper = (target: string, elem) => {
        if (LinksDict.githubLinks[target]) {
            return {
                href: LinksDict.githubLinks[target] as string,
            }
        }
        return hostMappers.github(target, elem)
    }
    MdWidgets.CrossLink.Mapper = (target: string, elem) => {
        if (LinksDict.crossLinks[target]) {
            return {
                href: LinksDict.crossLinks[target] as string,
            }
        }
        return hostMappers.cross(target, elem)
    }

    const configuration = {
        ...CodeApiModule.configurationTsTypedoc,
        sectionView: ({
            router,
            src,
            mdViews,
        }: {
            router: Router
            src: string
            mdViews: Record<string, ViewGenerator>
        }) => {
            return new NotebookModule.NotebookSection({
                src,
                router,
                displayFactory,
                options: {
                    runAtStart: true,
                    markdown: {
                        views: mdViews,
                        placeholders,
                        preprocessing: (inputString) => {
                            return inputString.replace(
                                /\{\{example-object#([\w-]+)\}\}/g,
                                (match, shape) => {
                                    return generateGeometryExample(shape)
                                },
                            )
                        },
                    },
                },
            })
        },
    }

    return CodeApiModule.codeApiEntryNode({
        name: pkJson.name,
        header: {
            icon: {
                tag: 'div' as const,
                innerText: '🌳',
            },
        },
        entryModule: 'tb-openalea',
        dataFolder: `${baseUrl}/assets/api`,
        rootModulesNav: {
            'tb-openalea': rootModulesNav.self,
            'vsf-core': rootModulesNav['vsf-core'],
        },
        configuration,
    })
}

function generateGeometryExample(shape: string) {
    // Customize the logic here — this is just an example
    return `
<js-cell cell-id='dag'>
const { vsfCore } = await webpm.install({
   esm:[
        '@vs-flow/core#^0.4.0 as vsfCore',
    ]
})
let project = new vsfCore.Projects.ProjectState()
const geometry = '💎.${shape}'
project = await project.with({
    toolboxes: {
        '💎':'@vs-flow/tb-three-js#^0.4.0',
        '📝':'@vs-flow/tb-tweakpane#^0.4.0'
    },
    workflow:{
        branches: [
            'pane >c> geometry >> viewer',
        ],
        modules: {
            geometry,
            viewer: '💎.viewer',
            pane: '📝.autoPane',
        },
        configurations:{
             pane: {
                 schema: geometry,
                 title: 'Geometry Params',
                 ignore:['workersPoolId'],
             },
             c: {
                 adaptor: ({data}) => ({configuration: data})
             }
        }
    },
})
display(project)
</js-cell>

<cell-output cell-id='dag' defaultStyle="aspect-ratio:1" full-screen="true">
</cell-output>

<js-cell cell-id='view'>
const sideNavClass = 'h-100 bg-dark text-light p-2 px-5'
const sideNavInputs = {
    icon: 'fas fa-tools',
    content: project.instancePool.get('pane').html(),
}
const sideNavLayout = Views.Layouts.sideNav({
    sideNavElements: {
        tools: sideNavInputs,
   },
    content: project.instancePool.get('viewer').html(),
})
display(sideNavLayout)
</js-cell>

<cell-output cell-id='view' defaultStyle="aspect-ratio:1" full-screen="true">
</cell-output>
`
}
