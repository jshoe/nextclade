import type { Router } from 'next/router'

import { configureStore } from 'src/state/store'
import { createWorkerPools } from 'src/workers/createWorkerPools'
import { setLocale } from 'src/state/settings/settings.actions'
import { fetchInputsAndRunMaybe } from './io/fetchInputsAndRunMaybe'

export interface InitializeParams {
  router: Router
}

const allowResultsPage = process.env.NODE_ENV === 'development' && process.env.DEBUG_SET_INITIAL_DATA === 'true'

export async function initialize({ router }: InitializeParams) {
  if (!allowResultsPage && router.pathname === '/results') {
    await router.replace('/')
  }

  void router.prefetch('/') // eslint-disable-line no-void
  void router.prefetch('/results') // eslint-disable-line no-void

  const workerPools = await createWorkerPools()

  const { persistor, store } = await configureStore({ router, workerPools })

  const { localeKeyV2 } = store.getState().settings
  store.dispatch(setLocale(localeKeyV2))

  await fetchInputsAndRunMaybe(store.dispatch, router)

  return { persistor, store }
}
