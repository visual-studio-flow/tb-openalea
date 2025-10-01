import { Modules, Configurations } from '@vs-flow/core'
import { map, switchMap } from 'rxjs'
import { createObject } from './utils'

/**
 * ### ⚙️ Defines the module's configuration.
 *
 * *  `axes`: definitions of the axes
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

/**
 *
 * The python code running in the interpreter:
 * *  `axes` is captured as input
 * *  `result` is captured as output
 */
export const code = `
from openalea.mtg import MTG, fat_mtg

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
 *   - `data`: the reference to the result variable of {@link code}.
 *   - `context`: the original message context.
 *
 * @param arg Forward parameters with input stream and configuration
 */
export const outputs = (
    arg: Modules.OutputMapperArg<typeof configuration.schema, typeof inputs>,
) => ({
    output$: arg.inputs.input$.pipe(
        switchMap(({ configuration, context }) => {
            return createObject({
                client: arg.dependencies.openalea,
                code,
                inputs: {},
                capturedIn: {
                    axes: configuration.axes,
                },
                capturedOut: [],
            }).pipe(map((data) => ({ data, context })))
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
