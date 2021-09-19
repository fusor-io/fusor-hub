import { EventOperator } from '../../action-flow';
import { ReteNode } from './rete.model';

export interface BuildBlock {
  node: ReteNode;
  operator: EventOperator | undefined;
}

export type BuildQueue = BuildBlock[]
