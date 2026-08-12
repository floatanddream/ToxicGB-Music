<script setup lang="ts">
import { motion, useSpring } from "motion-v"

interface Props {
	/** 点击回调 */
	onClick?: (e: MouseEvent) => void
	/** 自定义 class，追加到基础类（默认：flex 居中 + 圆形） */
	customClass?: string
	/** 按钮尺寸，如 'h-15 w-15'。默认 'h-15 w-15' (3.75rem) */
	size?: string
	/** hover 背景色，如 'hover:bg-[rgba(0,0,0,0.08)]'。默认同上 */
	hoverBg?: string
	/** 弹簧 damping。默认 10 */
	springDamping?: number
	/** 弹簧 stiffness。默认 300 */
	springStiffness?: number
	/** 按下时 scale 目标值。默认 0.85 */
	pressedScale?: number
}

const props = withDefaults(defineProps<Props>(), {
	customClass: '',
	size: 'h-15 w-15',
	hoverBg: 'hover:bg-[rgba(0,0,0,0.08)]',
	springDamping: 10,
	springStiffness: 300,
	pressedScale: 0.85,
})

const emit = defineEmits<{
	click: [evt: MouseEvent]
}>()

const spring = useSpring(1, {
	damping: props.springDamping,
	stiffness: props.springStiffness,
})

const onMouseDown = () => {
	spring.set(props.pressedScale)
}
const onRelease = () => {
	spring.set(1)
}
const handleClick = (e: MouseEvent) => {
	emit('click', e)
	props.onClick?.(e)
}
</script>

<template>
	<motion.div
		:class="[
			'flex justify-center items-center rounded-full cursor-pointer transition-colors duration-200',
			size,
			hoverBg,
			props.customClass,
		]"
		:style="{ scale: spring }"
		@click="handleClick"
		@mousedown="onMouseDown"
		@mouseup="onRelease"
		@mouseleave="onRelease"
	>
		<slot />
	</motion.div>
</template>