import { Immutables, Modules } from '@vs-flow/core'
import { from, map, switchMap } from 'rxjs'
import { get_interpreter } from './utils'
import {
    BufferAttribute,
    BufferGeometry,
    Group,
    Mesh,
    MeshStandardMaterial,
} from 'three'

/**
 * ### ⚙️ Defines the module's configuration.
 *
 * This module has no configuration parameters.
 */
export const configuration = {
    schema: {},
}

/**
 * ### 📥 Defines the module's inputs.
 *
 * #### `input$`
 *
 * A trigger input. Each incoming message causes the module to emit the QuakingAspen model.
 */
export const inputs = {
    input$: {},
}

const code = `
from oawidgets.plantgl import group_meshes_by_color

plot = wp.plot()
meshes = group_meshes_by_color(plot, side="front")
print("Number of mesh", len(meshes))

result = [{
    "position": [float(v) for sublist in mesh.vertices for v in sublist],
    "index": [int(i) for sublist in mesh.indices for i in sublist],
} for mesh in meshes]
`

function createBufferAttr<T extends Float32Array | Uint32Array>(
    Type: (new (buffer: ArrayBuffer | SharedArrayBuffer) => T) & {
        BYTES_PER_ELEMENT: number
    },
    array: Immutables<number>,
    size: number,
): BufferAttribute {
    const length = array.length * Type.BYTES_PER_ELEMENT
    const buffer = new Type(new ArrayBuffer(length))
    buffer.set(array)
    return new BufferAttribute(buffer, size)
}

function createBufferGeom(data: {
    position: Immutables<number>
    index: Immutables<number>
}) {
    const geometry = new BufferGeometry()

    geometry.setAttribute(
        'position',
        createBufferAttr(Float32Array, data.position, 3),
    )
    geometry.setIndex(createBufferAttr(Uint32Array, data.index, 1))

    geometry.computeVertexNormals()
    geometry.computeBoundingBox()
    geometry.computeBoundingSphere()

    return geometry
}
/**
 * ### 📤 Defines the module's outputs.
 *
 * #### `output$`
 *
 * Emits an object for each message received on `input$`, containing:
 *   - `data`: a `THREE.BoxGeometry` instance created from the current configuration.
 *   - `context`: the original message context.
 *
 * @param arg Forward parameters with input stream and configuration
 */
export const outputs = (
    arg: Modules.OutputMapperArg<typeof configuration.schema, typeof inputs>,
) => ({
    output$: arg.inputs.input$.pipe(
        switchMap(({ data, context }) => {
            return from(
                get_interpreter().createObject({
                    code,
                    inputs: {
                        wp: data,
                    },
                    capturedOut: ['result'],
                    capturedIn: {},
                }),
            ).pipe(
                map((resp) => {
                    const group = new Group()
                    resp.capturedOut.result
                        .map(
                            (data) =>
                                new Mesh(
                                    createBufferGeom(data),
                                    new MeshStandardMaterial({
                                        color: 0x3399ff,
                                    }),
                                ),
                        )
                        .forEach((mesh) => {
                            group.add(mesh)
                        })
                    return { data: group, context }
                }),
            )
        }),
    ),
})

/**
 * ### 🚀 Entry point for the module runtime.
 *
 * Combines {@link configuration}, {@link inputs}, and {@link outputs} into a single
 * {@link Modules.Implementation} instance.
 *
 * @param fwdParams Forward parameters, including input streams and configuration data.
 * @returns The initialized module implementation.
 */
export function module(
    fwdParams: Modules.ForwardArgs,
): Modules.Implementation<typeof configuration.schema> {
    return new Modules.Implementation(
        {
            configuration,
            inputs,
            outputs,
        },
        fwdParams,
    )
}
