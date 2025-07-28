export function stringifyBigInt(obj: any) {
    return JSON.parse(
        JSON.stringify(obj, (_, value) =>
            typeof value === 'bigint' ? value.toString() : value
        )
    );
}