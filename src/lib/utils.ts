export class OpenaleaIntepreter {
    interpreter: any

    constructor({}) {
        this.interpreter = window['openalea']
    }

    run({ capturedIn, capturedOut, cellId, code }): Promise<any> {
        const body = {
            code,
            capturedIn,
            capturedOut,
            cellId,
            previousCellIds: [],
        }
        return this.interpreter.fetchJson('/run', {
            method: 'post',
            body: JSON.stringify(body),
            headers: { 'content-type': 'application/json' },
        })
    }

    createObject({ code, inputs, capturedOut, capturedIn }): Promise<any> {
        const body = {
            code,
            inputs,
            capturedIn,
            capturedOut,
        }
        return this.interpreter.fetchJson('/create-object', {
            method: 'post',
            body: JSON.stringify(body),
            headers: { 'content-type': 'application/json' },
        })
    }
}

export function get_interpreter(): OpenaleaIntepreter {
    return new OpenaleaIntepreter({})
}
