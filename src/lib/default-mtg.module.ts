import { Modules, Configurations } from '@vs-flow/core'
import { from, map, switchMap } from 'rxjs'
import { get_interpreter } from './utils'

/**
 * ### ⚙️ Defines the module's configuration.
 *
 * This module has no configuration parameters.
 */
export const configuration = {
    schema: {
        axes: Modules.anyAttribute({
            value: [
                [0, 3, 2],
                [2, 1],
            ],
        }),
    },
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
from openalea.mtg import MTG, fat_mtg
# 'axes' is captured-input, 'result' as output 
g = MTG()
root = g.add_component(g.root)

def add_axis(vid, axis):
    stack = []
    for nb_ramif in axis:
        # Add ramification children
        for _ in range(nb_ramif):
            v = g.add_child(vid, edge_type="+")
            stack.append(v)
        # Add main axis continuation
        vid = g.add_child(vid, edge_type="<")
    return stack

# Start with the root
current_vertices = [root]

# Iteratively apply each axis
for axis in axes:
    next_vertices = []
    for vid in current_vertices:
        next_vertices.extend(add_axis(vid, axis))
    current_vertices = next_vertices

fat_mtg(g)
result = g
`
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
        switchMap(({ configuration, context }) => {
            console.log('Run default-mtg module', configuration)
            const openalea = get_interpreter()
            return from(
                openalea.createObject({
                    code,
                    inputs: {},
                    capturedIn: {
                        axes: configuration.axes,
                    },
                    capturedOut: [],
                }),
            ).pipe(map((data) => ({ data, context })))
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
