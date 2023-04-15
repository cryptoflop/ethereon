/* @refresh reload */
import './index.css'

import { render } from 'solid-js/web'
import { Router } from '@solidjs/router'

import Routing from './Routing'

render(() => <Router><Routing /></Router>, document.getElementById('root') as HTMLElement)