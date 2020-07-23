<script>
export default {
  name: 'MenuItem',
  functional: true,
  props: {
    icon: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: ''
    }
  },
  render(h, context) {
    const { icon, title } = context.props
    const vnodes = []

    if (icon) {
      if(icon.includes("sign")){
        vnodes.push(<div class='sign-icon' style="margin-right:15px;display:inline-block"><span class={icon}></span></div>)
      }else{
        vnodes.push(<svg-icon icon-class={icon}/>)
      }
    }
    if (title) {
      vnodes.push(<span slot='title'>{(title)}</span>)
    }
    return vnodes
  }
}
</script>
