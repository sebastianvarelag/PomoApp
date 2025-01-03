import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import { Controls } from "./Controls"
import { Menu } from "./Menu"
import useCountdown from "../../utils/useCountdown";
import { secondsToMinutes } from "../../helpers/helpers";
import { useCallback, useEffect, useState } from "react";
import { incrementRound, incrementTotalRoundSessionInterval, resetRoundSessionInterval, setMode, setSkip } from "@/redux/features/timerSlice";
import { useAudioPlayer } from "@/utils/sound";
import { Modal } from "./Modal";
import { ModalConfirmContent } from "./ModalConfirmContent";

export const Timer = () => {


  const { modes, mode, roundSessionInterval, longBreakInterval, autoPomodoro, autoBreak, skip } = useAppSelector(state => state.timer);
  const dispatch = useAppDispatch();

  const [showModalConfirm, setShowModalConfirm] = useState(false)

  const minutesMode = modes[mode as keyof typeof modes].sessionLength;

  const tickingSound = useAudioPlayer('/sounds/ticking.mp3', true);
  const alarmSound = useAudioPlayer('/sounds/alarm.mp3', false);

  const { ticking, progress, timeLeft, startTicking, stopTicking, resetTicking } = useCountdown({
    minutes: minutesMode,
    onInit: () => {
      if (mode === 'POMODORO') tickingSound.play();
    },
    onStop: () => {
      if (mode === 'POMODORO') tickingSound.stop();
    },
    onFinish: () => {
      onFinishSessionMode();
    },
  });
  
  const { minutesString, secondsString } = secondsToMinutes(timeLeft);
  
  const toggleTime = () => {
    if (!ticking) {
      startTicking();
    } else {
      stopTicking();
    }
  };

  const jumpTo = (id: string) => {
    resetTicking(); 
    dispatch(setMode(id));
  };
  
  const nextMode = useCallback((modeSelected?: string) => {
    if (modeSelected !== undefined) 
      if(timeLeft !== (minutesMode * 60) && !skip) dispatch(setSkip(null));
      else jumpTo(modeSelected); 
    else {
      switch (mode) {
        case "POMODORO":
          if (roundSessionInterval === longBreakInterval) {
            jumpTo("LONG_BREAK");
          } else {
            jumpTo("SHORT_BREAK");
          }
          break;
        case "SHORT_BREAK":
        case "LONG_BREAK":
          jumpTo("POMODORO");
          break;
        default:
          alert('error');
          break;
      }
    }
  }, [jumpTo, mode, longBreakInterval, roundSessionInterval]);

  const onFinishSessionMode = () => {
    switch (mode) {
      case "POMODORO":
          dispatch(incrementRound());
        break;
        case "SHORT_BREAK":
          dispatch(incrementTotalRoundSessionInterval());
        break;
        case "LONG_BREAK":
          dispatch(resetRoundSessionInterval());
        break;
      default:
        alert('error');
        break;
    }

    if(!skip) alarmSound.play();
    nextMode(); 
  };

  useEffect(() => {
    if (skip === null) {
      stopTicking();
      setShowModalConfirm(true);
    }
  }, [skip]);
  
  useEffect(() => {
    if (skip === true) {
      onFinishSessionMode();
      dispatch(setSkip(false));
    }
  }, [skip]);

  useEffect(() => {
    resetTicking();
    tickingSound.stop();
  }, [minutesMode, resetTicking]);

  useEffect(() => {
    if (!ticking && (mode === "POMODORO" && autoPomodoro || (mode === "SHORT_BREAK" || mode === "LONG_BREAK") && autoBreak)) {
      startTicking();
    }
  }, [mode, autoPomodoro, autoBreak]);

  return (
    <div className="flex w-full min-h-screen">
      <div className="flex flex-col justify-evenly w-full items-center py-6 gap-y-10">
        <Menu onChangeMode={nextMode}/>
        <div className="flex justify-center items-center min-w-[500px] min-h-[500px] bg-white/10 scale-50 sm:scale-75 md:scale-100 border-8 border-white/30 rounded-full relative">
            <div className="flex justify-center items-center text-9xl select-none">
              <span className="min-w-[160px] max-w-fit text-center">{minutesString}</span>
              <span>:</span>
              <span className="min-w-[160px] max-w-fit text-center">{secondsString}</span>
            </div>
            <svg className="absolute rotate-[270deg]" viewBox="0 0 90 90" height="600px" width="600px">
            <defs></defs>
            <circle r="38.9" cx="45" cy="45" fill="none" stroke="white" strokeLinecap="round" strokeWidth={2} strokeOpacity={1} strokeDasharray={244.4} strokeDashoffset={244.4 - (244.4 * progress)} transform="matrix(0.952228, 0, 0, 0.951022, 2.440749, 2.269741)"></circle>
          </svg>
        </div>
        <Controls ticking={ticking} toggleTime={toggleTime}/>
        
        <Modal isVisible={showModalConfirm} isConfirm title="Confirm" onClose={() => setShowModalConfirm(false)}>
          <ModalConfirmContent  onClose={() => setShowModalConfirm(false)}/>
        </Modal>
      </div>
    </div>
  )
}
