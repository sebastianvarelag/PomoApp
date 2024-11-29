"use client";

import { useState } from "react"
import { PauseIcon } from "../../../public/icons/PauseIcon"
import { SettingsIcon } from "../../../public/icons/SettingsIcon"
import { SkipIcon } from "../../../public/icons/SkipIcon"
import { Button } from "./Button"
import { Modal } from "./Modal"
import { ModalSettingsContent } from "./ModalSettingsContent";
import { PlayIcon } from "../../../public/icons/PlayIcon";
import { useAppSelector } from "@/redux/hooks";

interface controlsProps {
  ticking: boolean;
  toggleTime: () => void;
}

export const Controls = ({ticking, toggleTime}: controlsProps) => {

  const {mode, round } = useAppSelector(state => state.timer)

  const [showModal, setShowModal] = useState(false)

  const openModal = () =>{
    setShowModal(true)
  }

  return (
    <div className="flex flex-col gap-6 items-center">
      <span className="text-2xl font-semibold opacity-70">#{(mode === 'POMODORO') ? round : (round !== 1) ? (round - 1) : '1'}</span>
      <div className="flex w-full h-auto justify-center items-center">
        <div className="flex w-fit justify-around text-sm md:text-lg font-bold gap-x-6">  
          <Button openModal={openModal}>
            <SettingsIcon/>
          </Button>
          
          <Button toggleTime={toggleTime}>
            {
              ticking
                ? 
                <PauseIcon/>
                : 
                <PlayIcon/>
            }
            </Button>
          <Button isConfirm>
            <SkipIcon/>
          </Button>
        </div>
        <Modal isVisible={showModal} title="Settings" onClose={() => setShowModal(false)} isConfirm={false}>
          <ModalSettingsContent onClose={() => setShowModal(false)}/>
        </Modal>
      </div>
    </div>
  )
}
