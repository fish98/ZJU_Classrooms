

const site = ""

const sendPassword = () => {
    if (config) {
      localStorage.setItem('password', this.state.password)
      const fish = localStorage.getItem('password')
      const raw = await fetch('/apiNew/admin/get_admin_details', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Content-Fish': fish,
        },
        mode: 'cors',
        body: JSON.stringify({
          form_url: '8A670D5F688F3A5F',
          offset: 200,
        }),
      })
      console.log(raw)
      const items = await raw.json()
      // console.log(items)
      if (items.status) {
        this.setState({
          item: items.info,
          hideDialog: true,
        })
      } else {
        alert('password error')
        this.setState({

          hideDialog: false,
        })
      }
    }
}