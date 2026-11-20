"use client";
import { useStore } from "jotai";
import { startTransition, useEffect, useState } from "react";
import useWebSocket from "react-use-websocket";
import {
  instListPV,
  instListSubscription,
  socketURL,
  webSocketReconnectAttempts,
  webSocketReconnectInterval,
} from "@/app/commonVars";
import CheckToggle from "@/app/components/CheckToggle";
import {
  dehex_and_decompress,
  instListFromBytes,
} from "@/app/components/dehex_and_decompress";
import Groups from "@/app/components/Groups";
import {
  getGroupsWithBlocksFromConfigOutput,
  Instrument,
  RC_ENABLE,
  RC_INRANGE,
  SP_RBV,
  storePrecision,
  toPrecision,
  yesToBoolean,
} from "@/app/components/Instrument";
import { getPrefix, getPvValue } from "@/app/components/PVutils";
import { pvAtom } from "@/app/components/pvAtoms";
import TopBar from "@/app/components/TopBar";
import {
  type IfcBlock,
  type IfcPVWSMessage,
  type IfcPVWSRequest,
  PVWSRequestType,
} from "@/app/types";

export function InstrumentData({ instrumentName }: { instrumentName: string }) {
  const [showHiddenBlocks, setShowHiddenBlocks] = useState(false);
  const CONFIG_DETAILS = "CS:BLOCKSERVER:WD_CONF_DETAILS";
  const [currentInstrument, setCurrentInstrument] = useState<Instrument | null>(
    null,
  );
  const [lastUpdate, setLastUpdate] = useState<string>("");
  const [webSockErr, setWebSockErr] = useState("");

  const instName = instrumentName;

  useEffect(() => {
    if (instName != null) {
      document.title = instName.toUpperCase() + " | IBEX Web Dashboard";
    }
  }, [instName]);

  const store = useStore();

  const {
    sendJsonMessage,
  }: {
    sendJsonMessage: (a: IfcPVWSRequest) => void;
  } = useWebSocket(socketURL, {
    shouldReconnect: () => true,
    onOpen: () => {
      setWebSockErr("");
      setLastUpdate(""); // if this is called on a reconnect, we want to clear the last update so we can re-subscribe to everything again
      sendJsonMessage(instListSubscription);
    },
    onMessage: (m) => {
      const updatedPV: IfcPVWSMessage = JSON.parse(m.data);
      const updatedPVName: string = updatedPV.pv;
      const updatedPVbytes: string | null | undefined = updatedPV.b64byt;
      if (updatedPVName == instListPV && updatedPVbytes != null) {
        const prefix = getPrefix(instListFromBytes(updatedPVbytes), instName);
        const instrument = new Instrument(prefix);
        setCurrentInstrument(instrument);

        // subscribe to dashboard and run info PVs
        sendJsonMessage({
          type: PVWSRequestType.subscribe,
          pvs: Array.from(instrument.runInfoPVs.keys())
            .concat(Array.from(instrument.dashboard.keys()))
            .concat([`${prefix}${CONFIG_DETAILS}`]),
        });
      }

      if (
        currentInstrument &&
        updatedPVName == `${currentInstrument.prefix}${CONFIG_DETAILS}` &&
        updatedPVbytes != null
      ) {
        // config change, reset instrument groups
        if (updatedPVbytes == lastUpdate) {
          // config hasnt actually changed so do nothing
          return;
        }
        const newInstrument = currentInstrument.clone();
        newInstrument.groups = getGroupsWithBlocksFromConfigOutput(
          newInstrument.prefix,
          JSON.parse(dehex_and_decompress(atob(updatedPVbytes))),
        );

        sendJsonMessage({
          type: PVWSRequestType.subscribe,
          pvs: newInstrument.getAllBlockPVs(),
        });

        setLastUpdate(updatedPVbytes);
        setCurrentInstrument(newInstrument);
      } else {
        const pvVal = getPvValue(updatedPV);
        if (pvVal == undefined) return;
        let name = updatedPVName;
        let update = (pv: IfcBlock): IfcBlock => {
          storePrecision(updatedPV, pv);
          pv.value = toPrecision(pv, pvVal);
          if (updatedPV.seconds) pv.updateSeconds = updatedPV.seconds;
          if (updatedPV.units) pv.units = updatedPV.units;
          if (updatedPV.severity) pv.severity = updatedPV.severity;
          return pv;
        };
        if (name.endsWith(RC_INRANGE)) {
          name = name.replace(RC_INRANGE, "");
          update = (pv) => ({ ...pv, runcontrol_inrange: yesToBoolean(pvVal) });
        } else if (name.endsWith(RC_ENABLE)) {
          name = name.replace(RC_ENABLE, "");
          update = (pv) => ({ ...pv, runcontrol_enabled: yesToBoolean(pvVal) });
        } else if (name.endsWith(SP_RBV)) {
          name = name.replace(SP_RBV, "");
          update = (pv) => ({ ...pv, sp_value: toPrecision(pv, pvVal) });
        }
        startTransition(() =>
          store.set(pvAtom(name), (pv) => update({ ...pv })),
        );
      }
    },
    onError: () => {
      setWebSockErr(
        "Failed to connect to websocket - please check your network connection and contact Experiment Controls if this persists.",
      );
    },
    share: true,
    retryOnError: true,
    reconnectInterval: webSocketReconnectInterval,
    reconnectAttempts: webSocketReconnectAttempts,
  });

  if (!currentInstrument) {
    return <h1>Loading...</h1>;
  }
  return (
    <div className="p-2 w-full max-w-[1920px] mx-auto">
      <TopBar
        dashboard={currentInstrument.dashboard}
        instName={instName}
        runInfoPVs={currentInstrument.runInfoPVs}
        prefix={currentInstrument.prefix}
      />
      {webSockErr && <h1 className={"text-red-600"}>{webSockErr}</h1>}
      <div className="flex gap-2 ml-2 md:flex-row flex-col">
        <CheckToggle
          checked={showHiddenBlocks}
          setChecked={setShowHiddenBlocks}
          text={"Show hidden blocks"}
        />
      </div>
      <Groups
        groupsMap={currentInstrument.groups}
        instName={instName}
        showHiddenBlocks={showHiddenBlocks}
      />
    </div>
  );
}
