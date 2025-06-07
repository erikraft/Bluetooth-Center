'use client'

import { useEffect } from 'react'

export default function BleExplorer() {
  // Função que será disparada ao clicar
  const explorarBluetooth = async () => {
    try {
      if (!navigator.bluetooth) {
        alert('❌ Este navegador não suporta Web Bluetooth.')
        return
      }

      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['battery_service', 'device_information'],
      })

      console.log(`🔍 Dispositivo selecionado: ${device.name || device.id}`)

      const server = await device.gatt?.connect()
      if (!server) {
        console.error('❌ Não foi possível conectar ao GATT server.')
        return
      }

      const services = await server.getPrimaryServices()
      for (const service of services) {
        console.log(`⚙️ Serviço encontrado: ${service.uuid}`)
        const chars = await service.getCharacteristics()
        chars.forEach((c) => {
          const props = c.properties
          const list = [
            props.read && 'read',
            props.write && 'write',
            props.notify && 'notify',
            props.indicate && 'indicate',
          ].filter(Boolean)
          console.log(`   └ 📍 Característica: ${c.uuid} [${list.join(', ')}]`)
        })
      }

      // desconecta ao fechar a página
      window.addEventListener('beforeunload', () => {
        if (device.gatt?.connected) {
          device.gatt.disconnect()
          console.log('🔌 Dispositivo desconectado.')
        }
      })
    } catch (err: any) {
      console.error('⚠️ Erro ao explorar Bluetooth:', err)
    }
  }

  return (
    <div>
      <button
        id="explore-btn"
        className="px-4 py-2 bg-blue-600 text-white rounded"
        onClick={explorarBluetooth}
      >
        Conectar via Bluetooth
      </button>
    </div>
  )
}
