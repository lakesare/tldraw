import { track } from '@tldraw/state'
import * as React from 'react'
import { TLPointerEventInfo } from '../../editor/types/event-types'
import { useEditor } from '../../hooks/useEditor'
import { Matrix2d } from '../../primitives/Matrix2d'
import { toDomPrecision } from '../../primitives/utils'
import { releasePointerCapture, setPointerCapture } from '../../utils/dom'
import { getPointerInfo } from '../../utils/getPointerInfo'

/** @public */
export type TLSelectionBackgroundComponent = React.ComponentType<object>

export const DefaultSelectionBackground: TLSelectionBackgroundComponent = track(
	function SelectionBg() {
		const editor = useEditor()

		const events = React.useMemo(() => {
			const onPointerDown = (e: React.PointerEvent) => {
				if ((e as any).isKilled) return

				setPointerCapture(e.currentTarget, e)

				const info: TLPointerEventInfo = {
					type: 'pointer',
					target: 'selection',
					name: 'pointer_down',
					...getPointerInfo(e, editor.getContainer()),
				}

				editor.dispatch(info)
			}

			const onPointerMove = (e: React.PointerEvent) => {
				if ((e as any).isKilled) return

				const info: TLPointerEventInfo = {
					type: 'pointer',
					target: 'selection',
					name: 'pointer_move',
					...getPointerInfo(e, editor.getContainer()),
				}

				editor.dispatch(info)
			}

			const onPointerUp = (e: React.PointerEvent) => {
				if ((e as any).isKilled) return

				releasePointerCapture(e.currentTarget, e)

				const info: TLPointerEventInfo = {
					type: 'pointer',
					target: 'selection',
					name: 'pointer_up',
					...getPointerInfo(e, editor.getContainer()),
				}

				editor.dispatch(info)
			}

			return {
				onPointerDown,
				onPointerMove,
				onPointerUp,
			}
		}, [editor])

		const { selectionBounds: bounds, selectedIds } = editor
		if (!bounds) return null

		const shouldDisplay = editor.isInAny(
			'select.idle',
			'select.brushing',
			'select.scribble_brushing',
			'select.pointing_shape',
			'select.pointing_selection',
			'text.resizing'
		)

		if (selectedIds.length === 1) {
			const shape = editor.getShape(selectedIds[0])
			if (!shape) {
				return null
			}
			const util = editor.getShapeUtil(shape)
			if (util.hideSelectionBoundsBg(shape)) {
				return null
			}
		}

		const transform = Matrix2d.toCssString(
			Matrix2d.Compose(
				Matrix2d.Translate(bounds.minX, bounds.minY),
				Matrix2d.Rotate(editor.selectionRotation)
			)
		)

		return (
			<div
				className="tl-selection__bg"
				draggable={false}
				style={{
					transform,
					width: toDomPrecision(Math.max(1, bounds.width)),
					height: toDomPrecision(Math.max(1, bounds.height)),
					pointerEvents: shouldDisplay ? 'all' : 'none',
					opacity: shouldDisplay ? 1 : 0,
				}}
				{...events}
			/>
		)
	}
)
