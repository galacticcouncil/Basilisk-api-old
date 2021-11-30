import {
    Entity as Entity_,
    Column as Column_,
    PrimaryColumn as PrimaryColumn_,
} from 'typeorm';
import * as marshal from '../../generated/marshal';

@Entity_()
export class TestBlock {
    constructor(props?: Partial<TestBlock>) {
        Object.assign(this, props);
    }

    @PrimaryColumn_()
    id!: string;

    @Column_('numeric', {
        transformer: marshal.bigintTransformer,
        nullable: false,
    })
    blockHeight!: bigint;

    @Column_('timestamp with time zone', { nullable: false })
    createdAt!: Date;

    @Column_('integer', { nullable: false })
    poolId!: number;
}
