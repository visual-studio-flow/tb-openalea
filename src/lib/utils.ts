import { from } from 'rxjs'

export class OpenaleaInterpreter {
    client: any

    constructor(client) {
        this.client = client
    }

    run({ capturedIn, capturedOut, cellId, code }): Promise<any> {
        const body = {
            code,
            capturedIn,
            capturedOut,
            cellId,
            previousCellIds: [],
        }
        return this.client.fetchJson('/run', {
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
        return this.client.fetchJson('/create-object', {
            method: 'post',
            body: JSON.stringify(body),
            headers: { 'content-type': 'application/json' },
        })
    }
}

export function createObject({
    code,
    inputs,
    capturedOut,
    capturedIn,
    client,
}) {
    return from(
        new OpenaleaInterpreter(client).createObject({
            code,
            inputs,
            capturedIn,
            capturedOut,
        }),
    )
}
