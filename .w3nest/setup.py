from shutil import copyfile
from pathlib import Path

from w3nest.ci.ts_frontend import (
    AuxiliaryModule,
    ProjectConfig,
    PackageType,
    Dependencies,
    RunTimeDeps,
    Bundles,
    MainModule,
)
from w3nest.ci.ts_frontend.regular import generate_template
from w3nest.utils import parse_json

project_folder = Path(__file__).parent.parent

pkg_json = parse_json(project_folder / "package.json")

externals_deps = {
    "@vs-flow/core": "^0.4.0",
    "three": "^0.152.0",
    "rxjs": "^7.8.1",
    "mkdocs-ts": "^0.5.2",
    "@w3nest/webpm-client": "^0.1.5",
    "@mkdocs-ts/code-api": "^0.2.3",
    "@mkdocs-ts/notebook": "^0.1.5",
}
in_bundle_deps = {
    # only for types, maybe required for the compilation of consuming apps/libs
    "@types/three": "^0.152.0",
    "rx-vdom": "^0.1.7",
}
dev_deps = {}


def auxiliary_module(name: str, file: str) -> AuxiliaryModule:
    return AuxiliaryModule(
        name=name,
        entryFile=f"./lib/{file}.ts",
        loadDependencies=["@vs-flow/core", "rxjs", "three"],
    )


auxiliary_modules = [
    auxiliary_module("quakingAspen", "quaking-aspen.module"),
    auxiliary_module("defaultMtg", "default-mtg.module"),
    auxiliary_module("weberMtg", "weber-mtg.module"),
    auxiliary_module("mtgPlot", "mtg-plot.module"),
]


config = ProjectConfig(
    path=project_folder,
    type=PackageType.LIBRARY,
    name=pkg_json["name"],
    version=pkg_json["version"],
    shortDescription=pkg_json["description"],
    author=pkg_json["author"],
    dependencies=Dependencies(
        runTime=RunTimeDeps(externals=externals_deps, includedInBundle=in_bundle_deps),
        devTime=dev_deps,
    ),
    bundles=Bundles(
        mainModule=MainModule(
            entryFile="./lib/toolbox.ts",
            loadDependencies=["@vs-flow/core"],
            aliases=[],
        ),
        auxiliaryModules=[
            *auxiliary_modules,
            # AuxiliaryModule(
            #     name="Doc",
            #     entryFile="./doc/index.ts",
            #     loadDependencies=[
            #         "mkdocs-ts",
            #         "@w3nest/webpm-client",
            #     ],
            # ),
        ],
    ),
    inPackageJson={
        "scripts": {"doc": "npx tsx .w3nest/doc.ts"},
    },
    links={
        "Documentation": f"https://w3nest.org/apps/@vs-flow/doc/latest?nav=/api/toolboxes/tb-three-js",
        "Visual Studio Flow": "https://github.com/visual-studio-flow",
    },
)

template_folder = project_folder / ".w3nest" / ".template"
generate_template(config=config, dst_folder=template_folder)

files = [
    "README.md",
    ".gitignore",
    ".prettierignore",
    ".prettierrc.json",
    "eslint.config.mjs",
    "jest.config.ts",
    "LICENSE",
    "package.json",
    "README.md",
    "rx-vdom.config.ts",
    "tsconfig.json",
    "jest.config.ts",
    "typedoc.js",
    "webpack.config.ts",
]
for file in files:
    copyfile(src=template_folder / file, dst=project_folder / file)
