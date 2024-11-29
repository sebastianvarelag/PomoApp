"use client";

import { useAppSelector } from "@/redux/hooks";
import { useEffect, useState } from "react"

type propsMenu = {
  onChangeMode: (mode: string) => void
}

type propsButton = {
  children: React.ReactNode;
  active: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>, mode: string) => void;
}

export const Menu = ({onChangeMode}: propsMenu) => {

  const { modes, mode } = useAppSelector(state => state.timer)

  const [dimension, setDimension] = useState({
    width: 0, left: 0
  });

  const getDimension = () => {
    const button = document.querySelector("button.active") as HTMLButtonElement | null;
    if (button) {
      const { offsetWidth, offsetLeft } = button;
      setDimension({
        width: offsetWidth,
        left: offsetLeft
      });
    }
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>, modeSelected: string): void => {
    const { offsetWidth, offsetLeft } = event.currentTarget;
    setDimension({
      width: offsetWidth,
      left: offsetLeft
    });

    onChangeMode(modeSelected);

  }

  useEffect(() => {
    window.addEventListener('resize', getDimension);
    return () => window.removeEventListener('resize', getDimension);
  }, []);

  useEffect(() => {
    getDimension();
  }, [onChangeMode]);

  const ButtonMenu = ({ children, active, onClick }: propsButton) => {
    return (
      <li>
        <button
          className={`w-full h-20 px-6 md:px-8 opacity-75 border-b-4 border-transparent transition-all delay-100 hover:border-b-4 hover:border-white/40${active ? ' active' : ''}`}
          onClick={(e) => onClick && onClick(e, 'default-mode')}
        >
          {children}
        </button>
      </li>
    );
  }

  return (
    <div className="flex justify-center w-full min-w-fit h-20 relative">
      <ul className="flex text-md md:text-xl bg-white/10 relative">
        {
          Object.values(modes).map(({ id, label }) =>
            <ButtonMenu
              key={id}
              active={id === mode}
              onClick={(e) => handleClick(e, id)}
            >
              {label}
            </ButtonMenu>
          )
        }
        <span className="animation" style={{ width: dimension.width, left: dimension.left }}></span>
      </ul>
    </div>
  );
}
