import React from 'react';
import languageData from './data';

import {Dropdown} from 'antd';
import {LayoutDirection} from '@crema/constants/AppEnums';
import {
  useLocaleActionsContext,
  useLocaleContext,
} from '@crema/context/AppContextProvider/LocaleContextProvider';
import {useLayoutActionsContext} from '@crema/context/AppContextProvider/LayoutContextProvider';
import {IoLanguageOutline} from 'react-icons/io5';
import {
  StyledLangBtn,
  StyledLangIcon,
  StyledLangText,
  StyledLangItem,
} from './index.styled';
import {LanguageProps} from '@crema/types/models/Apps';

type AppLanguageSwitcherProps = {
  iconOnly?: boolean;
};
const AppLanguageSwitcher: React.FC<AppLanguageSwitcherProps> = () => {
  const {rtlLocale, locale} = useLocaleContext();
  const {updateLocale} = useLocaleActionsContext();
  const {updateDirection} = useLayoutActionsContext();

  const changeLanguage = (language: LanguageProps) => {
    if (rtlLocale.indexOf(language.locale) !== -1) {
      updateDirection(LayoutDirection.RTL);
    } else {
      updateDirection(LayoutDirection.LTR);
    }
    updateLocale(language);
  };

  const items = languageData.map((language, index) => {
    return {
      key: index,
      label: (
        <StyledLangItem key={index} onClick={() => changeLanguage(language)}>
          <h4>{language.name}</h4>
        </StyledLangItem>
      ),
    };
  });

  return (
    <>
      <Dropdown
        menu={{items}}
        trigger={['click']}
        overlayStyle={{zIndex: 1052}}
      >
        <StyledLangBtn
          className='ant-dropdown-link langBtn'
          onClick={(e) => e.preventDefault()}
        >
          <StyledLangIcon>
            <IoLanguageOutline />
          </StyledLangIcon>
          <StyledLangText className='lang-text'>{locale.name}</StyledLangText>
        </StyledLangBtn>
      </Dropdown>
    </>
  );
};

export default AppLanguageSwitcher;
