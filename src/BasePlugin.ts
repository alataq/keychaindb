type PrimitiveValue = string | number | boolean;
export type Value = PrimitiveValue | PrimitiveValue[];

export interface Data {
    value: Value;
    [key: string]: any; // Allows plugins to add other properties
}

export abstract class BasePlugin {
    public api?: object;

    public abstract onLoad(db: any): void;

    // Hooks
    public beforeSet?(key: string, value: Value, data: Data, next: (newKey?: string, newValue?: Value, newData?: Data) => void): void;
    
    public afterSet?(key: string, data: Data): void;

    public beforeGet?(key: string, next: (newKey?: string) => void): void;

    public afterGet?(key: string, data: Data): void;

    public beforeDelete?(key: string, next: (newKey?: string) => void): void;

    public afterDelete?(key: string): void;

    // Events
    public onSet?(key: string, data: Data): void;

    public onGet?(key: string, data: Data): void;

    public onDelete?(key: string): void;
}