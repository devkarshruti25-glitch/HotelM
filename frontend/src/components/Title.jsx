import React from 'react'

const Title = ({text1, text2}) => {
  return (
    <div className='inline-flex items-center gap-2 mb-3'>
        {/* Set the primary text to Deep Charcoal */}
        <p className='text-[#2C3E50]'>
            {text1}
            &nbsp;
            {/* Set the accented text to Rich Bronze */}
            <span className='font-medium text-[#A37D40]'>{text2}</span>
        </p>
        {/* Set the accent line to Rich Bronze */}
        <p className='w-8 sm:w-12 h-[1px] sm:h-[2px] bg-[#A37D40]'></p>
    </div>
  )
}

export default Title
