import { Modules } from '@vs-flow/core'
import { map, switchMap } from 'rxjs'
import { createObject } from './utils'

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

/**
 *
 * The python code running in the interpreter:
 * *  `result` is captured as output
 */
export const code = `
from openalea.weberpenn.tree_client import Quaking_Aspen
result = Quaking_Aspen()
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
        switchMap(({ context }) => {
            return createObject({
                client: arg.dependencies.openalea,
                code,
                inputs: {},
                capturedIn: {},
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
