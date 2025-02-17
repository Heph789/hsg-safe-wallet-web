import { trackEvent } from '@/services/analytics'
import { RECOVERY_EVENTS } from '@/services/analytics/events/recovery'
import { Typography } from '@mui/material'
import { useContext, useEffect } from 'react'
import type { ReactElement } from 'react'

import { SafeTxContext } from '../../SafeTxProvider'
import SignOrExecuteForm from '@/components/tx/SignOrExecuteForm'
import { useWeb3ReadOnly } from '@/hooks/wallets/web3'
import { getRecoverySkipTransaction } from '@/features/recovery/services/transaction'
import { createTx } from '@/services/tx/tx-sender'
import ErrorMessage from '@/components/tx/ErrorMessage'
import type { RecoveryQueueItem } from '@/features/recovery/services/recovery-state'

const onSubmit = () => {
  trackEvent({ ...RECOVERY_EVENTS.SUBMIT_RECOVERY_CANCEL })
}

export function CancelRecoveryFlowReview({ recovery }: { recovery: RecoveryQueueItem }): ReactElement {
  const web3ReadOnly = useWeb3ReadOnly()
  const { setSafeTx, setSafeTxError } = useContext(SafeTxContext)

  useEffect(() => {
    if (!web3ReadOnly) {
      return
    }
    const transaction = getRecoverySkipTransaction(recovery, web3ReadOnly)
    createTx(transaction).then(setSafeTx).catch(setSafeTxError)
  }, [setSafeTx, setSafeTxError, recovery, web3ReadOnly])

  return (
    <SignOrExecuteForm onSubmit={onSubmit} isBatchable={false}>
      <Typography mb={1}>
        All actions initiated by the Recoverer will be cancelled. The current owners will remain the owners of the Safe
        Account.
      </Typography>

      <ErrorMessage level="info">
        This transaction will initiate the cancellation of the{' '}
        {recovery.isMalicious ? 'malicious transaction' : 'recovery proposal'}. It requires other owner signatures in
        order to be executed.
      </ErrorMessage>
    </SignOrExecuteForm>
  )
}
