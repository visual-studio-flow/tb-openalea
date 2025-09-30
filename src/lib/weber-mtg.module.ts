import { Modules } from '@vs-flow/core'
import { from, map, switchMap } from 'rxjs'
import { get_interpreter } from './utils'

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
from openalea.weberpenn.mtg_client import Weber_MTG

result = Weber_MTG(param, g)
result.run()
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
        switchMap(({ data, configuration, context }) => {
            console.log('Run weber-mtg module', { data, configuration })
            const openalea = get_interpreter()
            return from(
                openalea.createObject({
                    code,
                    inputs: {
                        param: data[0],
                        g: data[1],
                    },
                    capturedIn: {},
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
