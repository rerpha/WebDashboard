import { atom, type PrimitiveAtom, useAtomValue } from "jotai";
import { useMemo } from "react";
import type { IfcBlock, tBlockMapping } from "@/app/types";

const pvAtoms = new Map<string, PrimitiveAtom<IfcBlock>>();

export function pvAtom(pv: string): PrimitiveAtom<IfcBlock> {
  if (!pvAtoms.has(pv)) pvAtoms.set(pv, atom<IfcBlock>({ pvaddress: pv }));
  return pvAtoms.get(pv)!;
}

export function useLivePVs(pvs: tBlockMapping): tBlockMapping {
  const liveAtom = useMemo(
    () =>
      atom(
        (get) =>
          new Map(
            Array.from(pvs, ([k, v]) => [k, { ...v, ...get(pvAtom(k)) }]),
          ),
      ),
    [pvs],
  );
  return useAtomValue(liveAtom);
}
