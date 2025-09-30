import { generateApiFiles } from '../node_modules/@mkdocs-ts/code-api/src/mkapi-backends/mkapi-typescript'

const externals: any = {
    'rx-vdom': ({ name }: { name: string }) => {
        return `/apps/@rx-vdom/doc/latest?nav=/api.${name}`
    },
    '@vs-flow/core': ({ name }: { name: string }) => {
        const urls = {
            ImmutableObj: '@nav[vsf-core]/ImmutableObj',
            Integer: '@nav[vsf-core]/Configurations.Integer',
            Float: '@nav[vsf-core]/Configurations.Float',
            Boolean: '@nav[vsf-core]/Configurations.Boolean',
            JsCode: '@nav[vsf-core]/Configurations.JsCode',
            Vector3D: '@nav[vsf-core]/Configurations.Vector3D',
            Color: '@nav[vsf-core]/Configurations.Color',
            String: '@nav[vsf-core]/Configurations.String',
            StringLiteral: '@nav[vsf-core]/Configurations.StringLiteral',
            ForwardArgs: '@nav[vsf-core]/Modules.ForwardArgs',
            OutputMapperArg: '@nav[vsf-core]/Modules.OutputMapperArg',
            Implementation: '@nav[vsf-core]/Modules.Implementation',
            InputMessage: '@nav[vsf-core]/Modules.InputMessage',
            ExpectationTrait: '@nav[vsf-core]/Contracts.ExpectationTrait',
            MessageContext: '@nav[vsf-core]/Modules.MessageContext',
            Context: '@nav[vsf-core]/Logging.Context',
        }

        if (!(name in urls)) {
            console.warn(
                `Can not find URL for @vs-flow/core's '${name}' symbol`,
            )
        }
        return urls[name]
    },
    typescript: ({ name }: { name: string }) => {
        const urls = {
            Promise:
                'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise',
            HTMLElement:
                'https://www.typescriptlang.org/docs/handbook/dom-manipulation.html',
            Record: 'https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type',
            Pick: 'https://www.typescriptlang.org/docs/handbook/utility-types.html#picktype-keys',
            MouseEvent:
                'https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent',
            Partial:
                'https://www.typescriptlang.org/docs/handbook/utility-types.html#partialtype',
            Omit: 'https://www.typescriptlang.org/docs/handbook/utility-types.html#omittype-keys',
            window: 'https://developer.mozilla.org/en-US/docs/Web/API/Window',
            HTMLHeadingElement:
                'https://developer.mozilla.org/en-US/docs/Web/API/HTMLHeadingElement',
            Set: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set',
            ClassMethodDecoratorContext:
                'https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html',
            DOMRect: 'https://developer.mozilla.org/en-US/docs/Web/API/DOMRect',
            ScrollToOptions:
                'https://developer.mozilla.org/fr/docs/Web/API/Window/scrollTo',
            HTMLDivElement:
                'https://developer.mozilla.org/en-US/docs/Web/API/HTMLDivElement',
            HTMLCanvasElement:
                'https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement',
            ResizeObserver:
                'https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver',
        }
        if (!(name in urls)) {
            console.warn(`Can not find URL for typescript's '${name}' symbol`)
        }
        return urls[name]
    },
    rxjs: ({ name }: { name: string }) => {
        const urls = {
            RxJS: 'https://rxjs.dev/',
            Subject: 'https://www.learnrxjs.io/learn-rxjs/subjects/subject',
            BehaviorSubject:
                'https://www.learnrxjs.io/learn-rxjs/subjects/subject',
            ReplaySubject:
                'https://www.learnrxjs.io/learn-rxjs/subjects/replaysubject',
            Observable: 'https://rxjs.dev/guide/observable',
            combineLatest: 'https://rxjs.dev/api/index/function/combineLatest',
            of: 'https://rxjs.dev/api/index/function/of',
            withLatestFrom:
                'https://rxjs.dev/api/index/function/withLatestFrom',
            zip: 'https://rxjs.dev/api/index/function/zip',
            from: 'https://www.learnrxjs.io/learn-rxjs/operators/creation/from',
            Subscription: 'https://rxjs.dev/guide/subscription',
        }
        if (!(name in urls)) {
            console.warn(`Can not find URL for rxjs's '${name}' symbol`)
        }
        return urls[name]
    },
}

generateApiFiles({
    projectFolder: `${__dirname}/../`,
    outputFolder: `${__dirname}/../assets/api`,
    externals,
    extraDeclarationReferences: {
        '*': {
            'Modules.anyAttribute': '@nav[vsf-core]/Modules.anyAttribute',
            'Modules.anyObjectAttribute':
                '@nav[vsf-core]/Modules.anyObjectAttribute',
            'Modules.booleanAttribute':
                '@nav[vsf-core]/Modules.booleanAttribute',
            'Modules.colorAttribute': '@nav[vsf-core]/Modules.colorAttribute',
            'Modules.customAttribute': '@nav[vsf-core]/Modules.customAttribute',
            'Modules.floatAttribute': '@nav[vsf-core]/Modules.floatAttribute',
            'Modules.integerAttribute':
                '@nav[vsf-core]/Modules.integerAttribute',
            'Modules.jsCodeAttribute': '@nav[vsf-core]/Modules.jsCodeAttribute',
            'Modules.listAttribute': '@nav[vsf-core]/Modules.listAttribute',
            'Modules.stringLiteralAttribute':
                '@nav[vsf-core]/Modules.stringLiteralAttribute',
            'Contracts.all': '@nav[vsf-core]/Contracts.all',
            'Contracts.any': '@nav[vsf-core]/Contracts.any',
            'Contracts.attribute': '@nav[vsf-core]/Contracts.attribute',
            'Contracts.contract': '@nav[vsf-core]/Contracts.contract',
            'Contracts.count': '@nav[vsf-core]/Contracts.count',
            'Contracts.free': '@nav[vsf-core]/Contracts.free',
            'Contracts.instanceOf': '@nav[vsf-core]/Contracts.instanceOf',
            'Contracts.of': '@nav[vsf-core]/Contracts.of',
            'Contracts.optionals': '@nav[vsf-core]/Contracts.optionals',
            'Contracts.single': '@nav[vsf-core]/Contracts.single',
            'Contracts.some': '@nav[vsf-core]/Contracts.some',
        },
    },
})
