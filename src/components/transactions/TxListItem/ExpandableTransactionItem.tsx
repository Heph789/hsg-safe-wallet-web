import {
  getTransactionDetails,
  type Transaction,
  type TransactionDetails,
} from '@safe-global/safe-gateway-typescript-sdk'
import { Accordion, AccordionDetails, AccordionSummary, Box, Skeleton } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import TxSummary from '@/components/transactions/TxSummary'
import TxDetails from '@/components/transactions/TxDetails'
import CreateTxInfo from '@/components/transactions/SafeCreationTx'
import { isCreationTxInfo } from '@/utils/transaction-guards'
import { useContext } from 'react'
import { BatchExecuteHoverContext } from '@/components/transactions/BatchExecuteButton/BatchExecuteHoverProvider'
import css from './styles.module.css'
import classNames from 'classnames'
import { trackEvent, TX_LIST_EVENTS } from '@/services/analytics'
import useSafeInfo from '@/hooks/useSafeInfo'
import useAsync from '@/hooks/useAsync'
import useChainId from '@/hooks/useChainId'
import { useTimelockTx } from '@/hooks/hsgsuper/hsgsuper'

type ExpandableTransactionItemProps = {
  isGrouped?: boolean
  item: Transaction
  txDetails?: TransactionDetails
}

export const ExpandableTransactionItem = ({
  isGrouped = false,
  item,
  txDetails,
  testId,
}: ExpandableTransactionItemProps & { testId?: string }) => {
  const hoverContext = useContext(BatchExecuteHoverContext)

  const isBatched = hoverContext.activeHover.includes(item.transaction.id)

  const { safe } = useSafeInfo()
  const chainId = useChainId()

  const [txDetailsData, error, loading] = useAsync<TransactionDetails>(
    async () => {
      return txDetails || getTransactionDetails(chainId, item.transaction.id)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [txDetails, chainId, item.transaction.id, safe.txQueuedTag],
    false,
  )

  const { timelockTx } = useTimelockTx(txDetailsData)

  return (
    <Accordion
      disableGutters
      TransitionProps={{
        mountOnEnter: true,
        unmountOnExit: false,
      }}
      elevation={0}
      defaultExpanded={!!txDetails}
      className={classNames({ [css.batched]: isBatched })}
      data-testid={testId}
      onChange={(_, expanded) => {
        if (expanded) {
          trackEvent(TX_LIST_EVENTS.EXPAND_TRANSACTION)
        }
      }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ justifyContent: 'flex-start', overflowX: 'auto' }}>
        <TxSummary item={item} timelockTx={timelockTx} isGrouped={isGrouped} />
      </AccordionSummary>

      <AccordionDetails data-testid="accordion-details" sx={{ padding: 0 }}>
        {isCreationTxInfo(item.transaction.txInfo) ? (
          <CreateTxInfo txSummary={item.transaction} />
        ) : (
          <TxDetails
            txSummary={item.transaction}
            timelockTx={timelockTx}
            txDetailsData={txDetailsData}
            loading={loading}
            error={error}
          />
        )}
      </AccordionDetails>
    </Accordion>
  )
}

export const TransactionSkeleton = () => (
  <>
    <Box pt="20px" pb="4px">
      <Skeleton variant="text" width="35px" />
    </Box>

    <Accordion disableGutters elevation={0} defaultExpanded>
      <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ justifyContent: 'flex-start', overflowX: 'auto' }}>
        <Skeleton width="100%" />
      </AccordionSummary>

      <AccordionDetails sx={{ padding: 0 }}>
        <Skeleton variant="rounded" width="100%" height="325px" />
      </AccordionDetails>
    </Accordion>
  </>
)

export default ExpandableTransactionItem
